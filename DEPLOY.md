# 실행 & 배포 가이드

## 1. 로컬에서 먼저 돌려보기

DB 없이는 페이지가 뜨지 않는 구조라(경력/프로젝트/기술 전부 DB에서 읽어옴), 로컬 개발용으로도 Postgres 하나가 필요합니다. 가장 빠른 방법은 무료 관리형 Postgres(Neon, Supabase 등)를 하나 만들어 로컬/서버 양쪽에서 재사용하는 것입니다. (아래 4번에서 Oracle VM에 직접 설치하는 방법도 다룹니다.)

```bash
cd jys_portfolio
npm install
cp .env.example .env
# .env 열어서 POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING 에
# 발급받은 Postgres 연결 문자열을 넣기

npx prisma migrate dev --name init   # 테이블 생성
npm run prisma:seed                  # 내 프로필/경력/프로젝트 데이터 채우기
npm run dev                          # http://localhost:3000
```

정상적으로 뜨면 배포 단계로 넘어가면 됩니다.

---

## 2. Oracle Cloud 계정 만들기

1. https://www.oracle.com/cloud/free/ 접속 → **Start for free**
2. 이메일 인증, 신용/체크카드 등록 (본인 확인용, Always Free 리소스는 과금되지 않음)
3. 홈 리전(Home Region) 선택 — 나중에 못 바꾸니 서울(Seoul) 등 가까운 리전으로 선택
4. 가입 완료 후 OCI 콘솔 로그인

> ⚠️ 2026년 6월부터 순수 Always Free 계정의 Ampere A1(ARM) 무료 한도가 **4 OCPU/24GB → 2 OCPU/12GB**로 줄었습니다(계정 전체 합산 기준, 유료 전환 계정은 기존 4/24 유지). 이 포트폴리오는 리소스를 많이 안 쓰니 2 OCPU/12GB로도 충분합니다.

## 3. Always Free VM 인스턴스 생성

1. 콘솔 좌측 메뉴 → **Compute → Instances → Create Instance**
2. **Image and shape**
   - Image: **Canonical Ubuntu 24.04** (또는 22.04)
   - Shape: **Change shape** → **Ampere → VM.Standard.A1.Flex** 선택, OCPU 2 / Memory 12GB로 설정 (Always Free 표시 확인)
3. **Networking**: 기본 VCN 사용, **Public IP 할당** 체크
4. **Add SSH keys**: "Generate a key pair for me" 선택 후 **Private key 다운로드** (분실하면 접속 불가하니 꼭 저장)
5. **Create** 클릭 → 몇 분 후 인스턴스 상태가 RUNNING이 되면 **Public IP** 확인

### 방화벽(포트) 열기

Always Free VM은 기본적으로 80/443 포트가 막혀 있습니다.

1. 인스턴스 상세 페이지 → **Subnet** 클릭 → **Security Lists** → 기본 보안목록 선택
2. **Add Ingress Rules** 로 아래 두 개 추가
   - Source CIDR `0.0.0.0/0`, Destination Port `80` (HTTP)
   - Source CIDR `0.0.0.0/0`, Destination Port `443` (HTTPS)
3. VM 내부 방화벽(iptables/ufw)도 열어야 합니다 (아래 4번에서 처리)

## 4. VM 접속 & 환경 세팅

```bash
# private key 권한 설정 후 접속 (Windows는 WSL/PowerShell OpenSSH 사용)
chmod 400 ssh-key.key
ssh -i ssh-key.key ubuntu@<PUBLIC_IP>

# 내부 방화벽 오픈
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 설치 (VM 안에서 직접 운영)
sudo apt-get install -y postgresql
sudo -u postgres psql -c "CREATE USER jys WITH PASSWORD '강력한비밀번호';"
sudo -u postgres psql -c "CREATE DATABASE jys_portfolio OWNER jys;"

# pm2 (프로세스 상시 실행) & nginx (리버스 프록시)
sudo npm install -g pm2
sudo apt-get install -y nginx
```

## 5. 코드 올리고 빌드

```bash
# 로컬 PC의 jys_portfolio 폴더를 VM으로 복사 (Windows PowerShell에서 실행)
scp -i ssh-key.key -r jys_portfolio ubuntu@<PUBLIC_IP>:~/

# VM에서
cd ~/jys_portfolio
cp .env.example .env
# POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING 을
# postgresql://jys:강력한비밀번호@localhost:5432/jys_portfolio?schema=public 로 설정

npm install
npx prisma migrate deploy
npm run prisma:seed
npm run build
pm2 start npm --name jys-portfolio -- start
pm2 save
pm2 startup   # 안내되는 명령어 한 줄 추가 실행 (재부팅 시 자동 시작)
```

이제 `http://<PUBLIC_IP>:3000` 으로 접속되면 성공입니다.

## 6. Nginx로 80번 포트 연결 + 도메인

```nginx
# /etc/nginx/sites-available/jys-portfolio
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/jys-portfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

도메인은 형처럼 무료 DDNS(예: `kro.kr`, `duckdns.org`)를 받아서 A 레코드를 VM의 Public IP로 연결하면 됩니다. 도메인 연결 후 HTTPS는:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.kro.kr
```

## 7. 업데이트할 때

```bash
# 로컬에서 수정 → VM으로 다시 복사 후
cd ~/jys_portfolio
npm install
npx prisma migrate deploy
npm run build
pm2 restart jys-portfolio
```

---

### 참고

- Always Free 리소스는 계속 무료지만, 90일 무료 크레딧(트라이얼)과는 별개입니다 — 트라이얼 기간이 끝나도 Always Free 표시가 붙은 리소스는 계속 사용 가능합니다.
- VM을 장기간 유휴 상태로 두면 Oracle이 회수(reclaim)할 수 있으니, 만든 뒤에는 주기적으로 로그인/사용해주는 게 안전합니다.
