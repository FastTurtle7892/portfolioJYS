# 장윤석 포트폴리오

Next.js 14 (App Router)로 만든 개인 포트폴리오입니다. 디자인/구조는 형 포트폴리오(Next.js + Prisma + PostgreSQL)를 그대로 따랐고, 내용은 기존 GitHub Pages(FastTurtle7892.github.io)에 있던 프로필·경력·프로젝트를 옮겼습니다.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Prisma · PostgreSQL
- Framer Motion

## 로컬 실행

```bash
npm install
cp .env.example .env   # POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING 입력
npx prisma migrate dev --name init
npm run prisma:seed    # 내 프로필/경력/프로젝트 데이터 채우기
npm run dev
```

## 배포

DB(PostgreSQL)와 앱 호스팅이 모두 필요합니다. 예:

- **Vercel + Vercel Postgres / Neon / Supabase**: `vercel` 연동 후 `.env`에 넣은 값과 동일한 값을 환경변수로 등록, `npm run build`가 배포 시 자동 실행됩니다.
- **오라클 클라우드 Always Free VM**: VM에 PostgreSQL을 직접 설치하거나 컨테이너로 띄운 뒤, `npm run build && npm start` (또는 pm2/docker로 상시 구동) + 도메인 연결.

회원가입/호스팅 설정은 별도로 진행하시면 됩니다. 이 저장소는 어느 쪽으로 배포하든 그대로 사용할 수 있습니다.

## 데이터 구조

`prisma/schema.prisma`에 `experience`(경력/프로젝트 타임라인), `project`+`ProjectItem`(프로젝트 상세), `intro`(핵심 역량 3가지), `skill`(기술 스택), `education`(학력·자격·논문) 모델이 있습니다. 내용을 바꾸고 싶으면 `prisma/seed.ts`를 수정하고 `npm run prisma:seed`를 다시 실행하면 됩니다.
