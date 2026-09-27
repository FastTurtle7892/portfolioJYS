import { Category, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // idempotent: 재실행 시 기존 데이터 초기화 후 다시 채운다
  await prisma.projectItem.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.intro.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();

  // /project/:id URL이 삭제·재시드 반복에도 항상 1부터 순서대로 매겨지도록,
  // deleteMany()가 지우지 않는 SERIAL 시퀀스를 시드마다 1로 강제 리셋한다.
  await prisma.$executeRawUnsafe('ALTER SEQUENCE project_id_seq RESTART WITH 1');

  // ── 핵심 역량 (Intro) ──────────────────────────────
  await prisma.intro.createMany({
    data: [
      {
        title: "정밀 신호처리 & 데이터 정확도",
        detail:
          "I/Q 위상 복원으로 단일 채널에서도 거리 오차 <em>1cm 이하</em>를 구현하고, <em>DS-TWR</em>·<em>AoA</em> 기반 실시간 측위 시스템에서 반복 측정으로 개선폭을 수치로 검증합니다.",
      },
      {
        title: "임베디드-서버 데이터 통신",
        detail:
          "<em>TCP/WebSocket</em> 추상화, UART 시리얼 통신, 멀티스레드 설계로 임베디드 장비와 서버 간 데이터를 안정적으로 주고받는 통신 계층을 구현합니다.",
      },
      {
        title: "서버 플랫폼 & 데이터 파이프라인",
        detail:
          "FastAPI/Spring 기반 REST API, PostgreSQL, Docker로 서버를 구성하고, 하이브리드 검색(BM25+벡터) 기반 RAG 파이프라인과 비동기 처리로 실제 서비스 데이터를 안정적으로 처리합니다.",
      },
    ],
  });

  // ── 기술 스택 (Skill) ──────────────────────────────────────────
  // blobUrl: devicon/simpleicons/iconify CDN (next.config.js에 도메인 허용됨).
  // 로고가 없는 항목은 ""로 두면 SkillItem이 텍스트 폴백(앞 3글자)으로 표시함.
  const skillSeed: { category: Category; item: string; blobUrl?: string }[] = [
    // 언어
    { category: Category.LANGUAGE, item: "C (Embedded)", blobUrl: "/assets/img/skill_c.png" },
    { category: Category.LANGUAGE, item: "C++", blobUrl: "https://api.iconify.design/simple-icons/cplusplus.svg" },
    { category: Category.LANGUAGE, item: "Python", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { category: Category.LANGUAGE, item: "Java", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    // 프레임워크
    { category: Category.FRAMEWORK, item: "Spring Boot", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
    { category: Category.FRAMEWORK, item: "FastAPI", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
    { category: Category.FRAMEWORK, item: "ROS 2", blobUrl: "https://api.iconify.design/logos/ros.svg" },
    { category: Category.FRAMEWORK, item: "OpenCV", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg" },
    { category: Category.FRAMEWORK, item: "LangChain", blobUrl: "https://api.iconify.design/simple-icons/langchain.svg" },
    // 환경 및 도구
    { category: Category.ENV_TOOL, item: "Docker", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { category: Category.ENV_TOOL, item: "MQTT", blobUrl: "https://api.iconify.design/simple-icons/mqtt.svg" },
    { category: Category.ENV_TOOL, item: "MATLAB", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matlab/matlab-original.svg" },
    { category: Category.ENV_TOOL, item: "Gradle", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gradle/gradle-original.svg" },
    // 데이터/AI
    { category: Category.DATA_AI, item: "PostgreSQL", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { category: Category.DATA_AI, item: "MariaDB", blobUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg" },
    { category: Category.DATA_AI, item: "Milvus", blobUrl: "https://api.iconify.design/simple-icons/milvus.svg" },
  ];

  const skillIdByName: Record<string, number> = {};
  for (const s of skillSeed) {
    const created = await prisma.skill.create({
      data: { category: s.category, item: s.item, items: [], blobUrl: s.blobUrl ?? "" },
    });
    skillIdByName[s.item] = created.id;
  }
  const ids = (names: string[]) => names.map(n => skillIdByName[n]).filter(Boolean);

  // ── 프로젝트 (시간 순서대로) ────────────────────────────────────
  const projectSeed = [
    {
      title: "AoA 기반 단일 앵커 UWB RTLS",
      sub_title:
        "DS-TWR 거리 측정과 AoA 각도 추정을 융합해, 앵커 3개 이상이 필요한 기존 삼각측량 방식을 앵커 1개로 단순화한 실시간 2D 위치 추적(RTLS) 시스템",
      period: "2024.01 ~ 2024.02",
      // 데이터에 직접 색을 넣을 때는 Tailwind 클래스 대신 인라인 style을 쓴다 — 클래스는 빌드 시 정적 스캔으로만
      // CSS가 생성되므로, prisma/seed.ts처럼 스캔 대상 밖의 파일에 문자열로만 있으면 실제 빌드에서 스타일이 적용되지 않는다.
      member: '3인 팀 프로젝트 (<span style="color:#ef4444">임베디드 1</span>, MATLAB 시각화 1, PM 1)',
      techNames: ["C (Embedded)", "MATLAB"],
      // 헤더 구분선 바로 아래에 구조/셋업 사진 + 반복재생 데모 클립을 나란히 노출 (logo_url/preview_clip_url/intro_image_url 참고)
      logo_url: "/assets/img/kmu_logo.png",
      preview_clip_url: "/assets/img/aoa_demo_preview.webm",
      intro_image_url: "/assets/img/aoa_setup_photo.png",
      card_description: "DS-TWR·AoA 융합으로 앵커 1개만 쓰는 실시간 2D 위치추적 시스템",
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          group_key: "overview",
          content: [
            "기존 삼각측량 기반 RTLS는 위치 계산에 앵커 최소 3개 필요 — 설치 제약, 앵커 간 통신 오버헤드 증가",
            "DS-TWR로 거리(R), AoA로 각도(θ)를 함께 측정해 앵커 1개만으로 극좌표(R, θ)를 2D 좌표로 변환하도록 설계",
          ],
        },
        {
          title: "기존 방식 — 삼각측량 (앵커 3개 이상 필요)",
          group_key: "overview",
          content: [],
          blobUrl: "/assets/img/aoa_compare_triangulation.png",
          type: "GALLERY",
        },
        {
          title: "제안 방식 — AoA (앵커 1개)",
          group_key: "overview",
          content: [],
          blobUrl: "/assets/img/aoa_compare_aoa.png",
          type: "GALLERY",
        },
        {
          title: "DS-TWR와 AoA 방식이 궁금하다면",
          group_key: "overview",
          content: [
            "DS-TWR — 거리 측정",
            '<ul class="list-disc list-inside space-y-1"><li>태그-앵커 신호 3회 왕복시간으로 거리 계산</li><li>SS-TWR 대비 시계 오차(clock drift) 상쇄 → 고정밀 측정</li></ul>',
            "AoA — 각도 추정",
            '<ul class="list-disc list-inside space-y-1"><li>안테나 2개의 위상차(Δφ)로 입사각 계산, θ = arcsin(Δφ/π)</li><li>UWB 채널별 실측 보정 계수 적용해 캘리브레이션</li></ul>',
            "DS-TWR & AoA 융합",
          ],
          blobUrl: "/assets/img/dstwr_method_diagram.png",
          blobUrl2: "/assets/img/aoa_method_diagram.png",
          blobUrl3: "/assets/img/aoa_fusion_diagram.png",
          type: "COLLAPSIBLE",
        },
        {
          title: "담당 역할",
          content: ["DS-TWR + AoA 융합 알고리즘 설계, 펌웨어 구현"],
          blobUrl: "/assets/img/aoa_architecture.png",
        },
        {
          title: "문제 해결 1 — PDOA 위상 언랩 보정",
          type: "PROBLEM",
          content: [
            "안테나 2개 간격(17mm)과 신호 파장 특성상, 위상차(PDOA) 측정값이 특정 각도를 넘으면 실제값과 다르게 wrap-around되어 각도 추정이 순간적으로 엉뚱한 값으로 튀는 현상 발생",
            "안테나 간격·파장으로 위상차 임계값을 계산하고, 측정값이 임계값을 넘으면 ±2×임계값만큼 보정(언랩)해 실제 위상차로 복원한 뒤 각도 산출",
            "안테나 배치 특성상 발생하는 위상 폴딩으로 인한 각도 이상치 제거",
          ],
        },
        {
          title: "문제 해결 2 — UART 데이터 무결성 (CRC)",
          type: "PROBLEM",
          content: [
            'ASCII 텍스트(" D I %.2f P %.2f O A ") 기반 전송 방식 사용 — 최대 25바이트 가변 길이로 프레임 경계 동기화 곤란, CRC 부재로 값 손상 시 검출 불가',
            "[0xAA][거리 4B][각도 4B][CRC8][0x55] 구조의 11바이트 고정 길이 바이너리 패킷으로 교체, CRC-8/SMBUS로 무결성 검증",
            "패킷 크기 25B→11B(56%↓), 헤더/테일로 프레임 동기화 용이, CRC 오류 패킷 즉시 폐기로 잘못된 좌표 표시 방지",
          ],
        },
        {
          title: "결과",
          content: [
            "최종적으로 이동평균 필터(W=16) 채택 — 위치 추정 RMSE 22.45cm → 16.35cm로 27.2% 개선",
            "태그가 앵커 정면(거리) 방향으로 움직일 때는 각도 변화가 작아 각도 기반 추정의 민감도 저하, 해당 방향 좌표 오차가 더 크게 나타나는 경향 확인",
          ],
          blobUrl: "/assets/img/aoa_result_plot.png",
          imageWidthPercent: 80,
        },
        {
          title: "성과",
          content: ["전자파학회 제4회 대학생 창의설계경진대회 우수논문상(동상 🥉) 수상"],
          videoUrl: "https://www.youtube.com/watch?v=SgOs7Dkw7NQ",
        },
      ],
    },
    {
      title: "위상오차제거를 통한 UWB 측위 정확도 개선 및 응용",
      sub_title: "I/Q 위상 복원으로 거리 오차 1cm 이하 달성, ROS 2 기반 실시간 RTLS + 인터랙티브 게임 응용",
      period: "2024.09 ~ 2025.02",
      // 참여인원 색상은 AoA와 동일하게 인라인 style로 처리 (Tailwind 클래스는 seed.ts에선 정적 스캔이 안 됨)
      member: '5인 프로젝트 (<span style="color:#ef4444">임베디드 2</span>, MATLAB 1, 게임 애플리케이션 2)',
      techNames: ["C (Embedded)", "ROS 2", "Python", "OpenCV"],
      logo_url: "/assets/img/kmu_logo.png",
      preview_clip_url: "/assets/img/phase_demo_preview.webm",
      intro_image_url: "/assets/img/phase_setup_photo.png",
      card_description: "I/Q 위상 복원으로 거리 오차 1cm 이하 달성한 ROS 2 기반 실시간 RTLS",
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          group_key: "overview",
          content: [
            "UWB(초광대역) 통신의 단일 주파수 채널에서 I/Q 데이터로부터 위상 정보를 복원하여 DS-TWR의 거리 측정 오차를 기존 수 cm에서 1cm 이하로 개선한 고정밀 실시간 측위 시스템(RTLS)",
            "UWB 위치 추정 결과를 ROS 2로 연동해, 비전 트래킹과 결합한 인터랙티브 풍선 게임(Balloon Game) 애플리케이션으로 확장",
          ],
        },
        {
          title: "위상 복원 전후 거리 측정값 비교",
          group_key: "overview",
          content: [],
          blobUrl: "/assets/img/phase_compare_distance.png",
          type: "GALLERY",
        },
        {
          title: "위상 복원 전후 좌표 분포 비교 — 4개 앵커 거리를 삼각측량으로 좌표화",
          group_key: "overview",
          content: [],
          blobUrl: "/assets/img/phase_compare_coord.png",
          type: "GALLERY",
        },
        {
          title: "위상 보정 원리가 궁금하다면",
          group_key: "overview",
          content: [
            '<ul class="list-disc list-inside space-y-1"><li>Initiator→Responder, Responder→Initiator 두 방향의 위상값에는 국부발진기 오차(CFO)와 초기 위상 오프셋이 반대 부호로 포함</li><li>아래처럼 4개 패킷(Poll·Response·Final·Post_final)을 주고받으며 위상값을 방향에 맞춰 더하고 빼면 CFO·오프셋이 상쇄</li></ul>',
            '<span style="font-size:0.875em;">Initiator에서 Responder로 가는 패킷 방향 위상 식</span>',
            '<p style="font-size:0.92rem;white-space:nowrap;overflow-x:auto;margin:0;text-align:center;">θ<sub>I→Q</sub> = [-2πf<sub>c</sub>τ<sub>los</sub> - 2πΔf<sub>c</sub>t + (φ<sub>init</sub><sup>I</sup> - φ<sub>init</sup><sup>R</sup>)] mod 2π</p>',
            '<span style="font-size:0.875em;">Responder에서 Initiator로 가는 패킷 방향 위상 식</span>',
            '<p style="font-size:0.92rem;white-space:nowrap;overflow-x:auto;margin:0;text-align:center;">θ<sub>R→I</sub> = [-2πf<sub>c</sub>τ<sub>los</sub> + 2πΔf<sub>c</sub>t - (φ<sub>init</sub><sup>I</sup> - φ<sub>init</sup><sup>R</sup>)] mod 2π</p>',
            '<p class="font-semibold text-foreground/80 mb-1">4개 패킷 위상을 더하고 빼면 상쇄 가능</p><p style="font-size:0.92rem;white-space:nowrap;overflow-x:auto;margin:0;text-align:center;">θ = (θ<sub>Poll</sub>+θ<sub>Resp</sub>) - (θ<sub>Final</sub>-θ<sub>Post</sub>) = -4πf<sub>c</sub>τ mod 2π</p>',
            '<p class="font-semibold text-foreground/80 mb-1">위상오차 상쇄 후에 거리 보정값 도출 식</p><p style="font-size:0.92rem;line-height:1.7;margin:0;text-align:center;">λ = c/2f<sub>c</sub><br/>N = D<sub>measured</sub>/λ<br/>D<sub>adj</sub> = (θ/2π + N)λ</p>',
          ],
          blobUrl: "/assets/img/phase_packet_exchange.png",
          blobUrl2: "/assets/img/phase_diagram_iq.png",
          blobUrl3: "/assets/img/phase_diagram_ri.png",
          type: "COLLAPSIBLE",
        },
        {
          title: "담당 역할",
          content: ["위상 복원 알고리즘 설계 및 구현, 필터링 파이프라인 구축 (제1저자)"],
          blobUrl: "/assets/img/phase_architecture.png",
        },
        {
          title: "문제 해결 1 — 단일 채널 환경에서의 위상 모호성 제거",
          type: "PROBLEM",
          content: [
            "참고문헌은 채널 3·5 두 개 주파수를 번갈아 사용해 공통 위상오차를 제거했지만, 국내 UWB 기술기준은 채널 9(7,987.2MHz) 단일 채널만 허용해 그대로 적용 불가 — 단일 채널로 보정하면 위상값·정수값(N)이 측정마다 흔들려 레인징 오차가 커짐(위상 모호성)",
            "크기 25의 중위값(median) 필터를 위상값과 정수값(N) 각각에 독립적으로 적용해 흔들림을 안정화",
            "거리 측정 오차를 기존 방식 대비 1cm 이내로 개선(90% 샘플이 1cm 이내 오차)",
          ],
        },
        {
          title: "문제 해결 2 — ROS2 구독과 게임 루프의 블로킹 충돌",
          type: "PROBLEM",
          content: [
            "ROS2 거리 데이터 구독 콜백(rclpy.spin())은 블로킹 호출이라, 게임의 실시간 렌더 루프(Pygame)와 같은 스레드에서 돌리면 화면이 멈추거나 프레임이 끊김",
            "ROS2 구독 노드의 spin()을 별도 스레드로 분리하고 콜백으로 받은 거리값만 락으로 보호된 공유 상태에 저장 → 게임 메인 루프는 그 값을 읽기만 하는 구조로 설계 (DistanceSource 인터페이스로 ROS2/MQTT 소스를 교체 가능하게 추상화)",
            "프레임 드랍 없이 실시간 거리 데이터 수신, 4개 앵커 기반 위치를 반영한 인터랙티브 풍선 게임 정상 동작",
          ],
        },
        {
          title: "결과",
          group_key: "result",
          content: [
            "I/Q 위상 복원 적용으로 DS-TWR 단독 대비 거리 측정 오차를 수 cm 수준에서 1cm 이하로 개선",
            "10m 거리에서 500회 반복 측정<br/>히스토그램 — 위상 보정 후 오차 분포가 10m 근처로 좁게 수렴(빨강: 기존 DS-TWR, 파랑: 제안 방식)<br/>CDF — 전체 샘플의 90% 이상이 오차 1cm 이내(10% 기준 기존 3.82cm → 제안 0.45cm)",
            "Kalman 필터로 순간 노이즈를 제거해 안정적인 실시간 좌표 산출 확보, Python Pygame 기반 인터랙티브 풍선 게임으로 동작 검증",
          ],
        },
        {
          title: "거리 히스토그램 비교 (10m, 500회 측정)",
          group_key: "result",
          content: [],
          blobUrl: "/assets/img/phase_result_histogram.png",
          type: "GALLERY",
        },
        {
          title: "위치 오차 CDF 비교 (90% 샘플이 1cm 이내)",
          group_key: "result",
          content: [],
          blobUrl: "/assets/img/phase_result_cdf.png",
          type: "GALLERY",
        },
        {
          title: "성과",
          content: [
            "전자파학회 제5회 대학생 창의설계경진대회 우수논문상(동상 🥉) 수상",
            "장윤석, 한수민, 장병준, \"단일 채널을 활용한 1 cm 이하의 고정밀 UWB 구현 및 응용\"",
            '<a href="https://doi.org/10.5515/KJKIEES.2025.36.8.749" target="_blank" rel="noopener noreferrer">한국전자파학회논문지 36.8 (2025): 749-757 게재</a>',
          ],
          videoUrl: "https://www.youtube.com/watch?v=zzRW9kg5rdE",
        },
      ],
    },
    {
      title: "IEEE 802.15.4z UWB 거리측정 성능 최적화",
      sub_title: "SS-TWR / DS-TWR 시간 파라미터 최적화로 정확도·속도 동시 개선",
      period: "2025.03",
      member: "제1저자",
      techNames: ["C (Embedded)", "MATLAB"],
      logo_url: "/assets/img/kmu_logo.png",
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          group_key: "overview3",
          content: [
            "UWB IC(Qorvo DW3000)의 실제 하드웨어 처리 시간과 PHY 파라미터(프리앰블 길이 등)에 따른 패킷 길이 정밀 분석.",
            "SS-TWR의 거리 오차 방지와 DS-TWR의 측정 횟수 극대화를 위한 최적 시간 파라미터 선정 방법 제안.",
          ],
        },
        {
          title: "SS-TWR / DS-TWR 방식이 궁금하다면",
          group_key: "overview3",
          content: [
            "SS-TWR",
            "<br/>Poll·Response 2개 패킷을 주고받아 거리를 구하는 가장 단순한 방식.",
            "DS-TWR",
            "<br/>Poll·Response·Final 3개 패킷을 주고받아 클럭 오차를 상쇄해 정확도를 높인 방식.",
          ],
          blobUrl: "/assets/img/ranging_ss_twr_principle.png",
          blobUrl2: "/assets/img/ranging_ds_twr_principle.png",
          type: "COLLAPSIBLE",
        },
        {
          title: "담당 역할",
          group_key: "role3",
          content: [
            "TWR 프로토콜 분석, 하드웨어 처리 시간 측정, 최적 파라미터 계산 방법론 개발 및 검증",
            "응답 시간(Treply)을 최적화하기 위해, 송수신 전환에 걸리는 하드웨어 처리 시간과 패킷 전송 시간을 각각 수식으로 계산.",
            "사용 수식<br/>T_frame = T_symbol × (프리앰블 심볼 수 + SFD 심볼 수) + T_data<br/>T_reply_min = T_switch(송수신 전환 처리 시간) + T_frame(패킷 전송 시간)",
          ],
        },
        {
          title: "SS-TWR 패킷 교환 타이밍 시뮬레이션 (MATLAB)",
          content: [],
          blobUrl: "/assets/img/ranging_ss_twr_timing_matlab.png",
          type: "GALLERY",
          group_key: "role3",
        },
        {
          title: "DS-TWR 패킷 교환 타이밍 시뮬레이션 (MATLAB)",
          content: [],
          blobUrl: "/assets/img/ranging_ds_twr_timing_matlab.png",
          type: "GALLERY",
          group_key: "role3",
        },
        {
          title: "문제 해결 1 — SS-TWR 오차 발생 조건 확인",
          content: [
            "SS-TWR에서 Treply가 IC 최소 처리 시간(Treply_min) 미만이면 거리 오차 급증",
            "IC의 하드웨어 처리 시간과 패킷 길이를 수식으로 모델링해 Treply_min 계산<br/>Treply가 이 값 이상일 때 오차가 안정적으로 수렴하는 경향 확인",
            "오차 없이 동작하는 SS-TWR 파라미터 설정 가이드라인 도출",
          ],
          type: "PROBLEM",
        },
        {
          title: "문제 해결 2 — DS-TWR 측정 횟수 극대화",
          content: [
            "DS-TWR에서 Treply를 늘리면 단위 시간당 측정 가능 횟수 감소",
            "최적 Treply 계산 방법론 제안<br/>MATLAB 시뮬레이션과 실제 하드웨어 실험으로 교차 검증",
            "정확도를 유지하며 단위 시간 내 측정 횟수 극대화, 이론값과 실험값의 경향 비교 확인",
          ],
          type: "PROBLEM",
        },
        {
          title: "결과",
          group_key: "result3",
          blobUrl: "/assets/img/ranging_ss_twr_variance_result.png",
          imageWidthPercent: 55,
          content: [
            "SS-TWR에서 Treply를 711~1511us 범위로 바꿔가며 거리 측정값 분산 비교 실험 진행",
            "Treply가 커질수록 분산 증가 — 계산된 최소 Treply에 가까울수록 정확도에 유리함 확인",
          ],
        },
        {
          title: "DS-TWR 결과",
          group_key: "result3",
          blobUrl: "/assets/img/ranging_ds_twr_preamble_result.png",
          imageWidthPercent: 90,
          content: [
            "프리앰블 길이 128, 1024 설정에서 Treply1+Treply2 합을 바꿔가며 10초당 거리 측위 횟수를 계산값·실측값으로 비교하는 실험 진행",
            "Treply 합이 커질수록 측위 횟수 감소, 계산값과 실측값의 경향 유사함 확인",
          ],
        },
        {
          title: "성과",
          content: [
            "장윤석, 한수민, 장병준, \"IEEE 802.15.4z UWB의 거리측정 정확도와 측정시간 최적화\"",
            '<a href="https://doi.org/10.5515/KJKIEES.2025.36.3.274" target="_blank" rel="noopener noreferrer">한국전자파학회논문지 36.3 (2025): 274-282 게재</a>',
          ],
        },
      ],
    },
    {
      title: "RobotPal - JETANK 로봇팔 가상 시뮬레이터",
      sub_title:
        "현실 세계의 물리적 제약과 안전 문제 없이 JETANK 로봇팔을 학습·검증할 수 있는 크로스플랫폼 가상 시뮬레이터.",
      period: "2025.11 ~ 2025.12",
      member: "팀 프로젝트",
      techNames: ["C++", "Docker"],
      logo_url: "/assets/img/robotpal_logo.png",
      preview_clip_url: "/assets/img/robotpal_demo_preview.webm",
      intro_image_url: "/assets/img/robotpal_setup_photo.png",
      card_description: "물리적 제약 없이 JETANK 로봇팔을 학습·검증하는 크로스플랫폼 가상 시뮬레이터",
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "JETANK 로봇팔의 훈련·테스트를 위한 크로스플랫폼 가상 시뮬레이션 환경.",
            "Emscripten을 통해 웹 브라우저에서도 동일하게 구동되는 것이 특징.",
          ],
        },
        {
          title: "담당 역할",
          content: [
            "네트워크 계층 추상화 설계 (TCP / WebSocket 다형성 구조), 싱글 스레드 → 멀티 스레드 리팩토링 (Thread-safe 수신 큐 구현)",
          ],
          blobUrl: "/assets/img/robotpal_architecture.png",
        },
        {
          title: "문제 해결 1 — 네트워크 계층 추상화",
          type: "PROBLEM",
          content: [
            "TCP와 WebSocket을 각각 다른 방식으로 다뤄야 해서 플랫폼별 분기 코드가 늘어나는 구조",
            "NetworkTransport 추상 인터페이스를 정의하고, 빌드 타임에 TcpNetworkTransport 또는 WebSocketTransport 구현체를 선택하는 팩토리 구조로 리팩토링",
            "Windows / Linux / macOS 네이티브 빌드와 Emscripten 기반 웹 빌드가 동일한 코드베이스로 동작",
          ],
        },
        {
          title: "문제 해결 2 — 싱글 스레드 → 멀티 스레드 리팩토링",
          type: "PROBLEM",
          content: [
            "네트워크 수신을 렌더링 루프와 같은 스레드에서 처리해 수신 대기 중 프레임 드롭 발생",
            "네트워크 수신을 전용 스레드로 분리하고, mutex로 보호되는 NetworkQueue로 두 스레드 간 데이터를 안전하게 전달",
            "프레임 드롭 없이 안정적인 실시간 렌더링 확보",
          ],
        },
        {
          title: "문제 해결 3 — JPEG 인코딩 성능 검증",
          type: "PROBLEM",
          content: [
            "JPEG 인코딩이 프레임 전송의 병목이 되어 스트리밍 성능에 영향",
            "libjpeg-turbo의 SIMD 최적화를 적용하고, hardware_concurrency()-3개의 워커 스레드 풀로 인코딩을 병렬화",
            "SIMD 적용으로 인코딩 시간 0.656ms → 0.119ms(약 5.5배) 단축, 워커 스레드 수별 벤치마크로 최적 워커 수 검증(1개 100% / 2개 96.4% / 4개 64.6% / 8개 44.9% 효율)",
          ],
        },
        {
          title: "결과",
          content: [
            '<a href="https://fastturtle7892.github.io/RobotPal/" target="_blank" rel="noopener noreferrer">웹에서 체험하기</a>',
            "조작법: 방향키로 로봇 이동, G키로 물체 잡기",
          ],
          group_key: "result_robotpal",
        },
        {
          title: "웹 브라우저에서 로봇을 직접 조작하며 확인할 수 있는 실행 화면",
          content: [],
          blobUrl: "/assets/img/robotpal_web_demo_screenshot.png",
          type: "GALLERY",
          group_key: "result_robotpal",
        },
      ],
    },
    {
      title: "NETS - 장비 불량 데이터 자동 재분류 (RAG)",
      sub_title: "하이브리드 검색(BM25 + Milvus) + LLM Judge RAG 파이프라인으로 모호한 불량 증상 자동 재분류",
      period: "2026.02 ~ 2026.04",
      member: "삼성전자 네트워크 사업부 연계 팀 프로젝트 (Frontend · Backend · AI 파트 분담)",
      techNames: ["Python", "FastAPI", "Docker"],
      logo_url: "/assets/img/nets_logo.png",
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "기지국 장비의 수리(RMA) 데이터 중 '기타', '기타 불량' 등 분류가 모호한 증상을 과거 정상 분류 데이터 기반으로 자동 재분류하는 RAG 파이프라인.",
            "하이브리드 검색(BM25 + Milvus)과 LLM Judge를 결합, 할루시네이션을 최소화.",
          ],
        },
        {
          title: "담당 역할",
          content: [
            "하이브리드 검색 파이프라인(BM25 + Milvus) 설계",
            "RRF / CC 스코어 결합 구현",
            "Cross-Encoder Re-ranker 플러그인 구조 설계",
            "LLM Judge 재분류 로직 구현",
          ],
          blobUrl: "/assets/img/nets_architecture.png",
        },
        {
          title: "문제 해결 1 — 하이브리드 검색 파이프라인 설계",
          content: [
            "문제: 순수 벡터 검색만으로는 키워드가 정확히 일치하는 케이스를 놓치는 검색 누락이 발생",
            "해결: Milvus 벡터 DB(임베딩 유사도)와 BM25(키워드) 검색을 동시에 수행하고 RRF/CC 스코어로 결과를 재순위화",
            "결과: 벡터 검색 단독 대비 검색 누락 보완, 재현율 향상",
          ],
        },
        {
          title: "문제 해결 2 — 정밀 재분류 파이프라인",
          content: [
            "문제: 상위 후보군 간 유사도 차이가 근소해 최종 분류 단계에서 오분류 위험이 있었음",
            "해결: Cross-Encoder Re-ranker로 상위 30건을 정밀 재채점하고, LLM Judge가 상위 5개 후보를 최종 분석해 카테고리 1건 추출",
            "결과: 모호한 불량 증상에 대한 자동 재분류 정확도 확보",
          ],
        },
        { title: "성과", content: ["삼성전자 네트워크사업부 연계 특화프로젝트(NETS) 우수팀 3등 수상"] },
      ],
    },
    {
      title: "Sticker - AI 코디 추천 패션 앱",
      sub_title:
        "AI가 추천한 코디를 모바일 앱과 스마트미러형 세로 디스플레이로 동시에 제공하는 N-Screen 패션 서비스.",
      period: "2026.04 ~ 2026.05",
      member: "팀 프로젝트 (Backend)",
      techNames: ["Java", "Spring Boot", "PostgreSQL", "Docker", "AWS SQS"],
      logo_url: "/assets/img/sticker_logo.png",
      preview_clip_url: "/assets/img/sticker_header_video1_app.webm|/assets/img/sticker_header_video2_nscreen.webm",
      intro_image_url: "/assets/img/sticker_result6_app_recommend.webp|/assets/img/sticker_result4_app_closet.webp",
      card_description: "모바일 앱과 스마트미러로 함께 즐기는 AI 코디 추천 서비스",
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "AI가 추천한 코디를 모바일 앱과 스마트미러형 세로 디스플레이로 동시에 제공하는 N-Screen 패션 서비스.",
            "디지털 옷장에 등록한 옷을 기반으로, 날씨·일정·상황에 맞춰 AI가 코디를 추천.",
          ],
        },
        {
          title: "담당 역할",
          content: ["회원 프로필·계정 관리 REST API 설계, 회원탈퇴 시 FK 순서를 고려한 계층적 삭제 로직 구현, Entity-DTO 계층 분리 설계"],
          blobUrl: "/assets/img/sticker_architecture.png",
        },
        {
          title: "문제 해결 1 — REST API·DTO 설계",
          content: [
            "문제: Entity를 응답에 그대로 노출하면 내부 DB 구조가 API 스펙에 종속되는 문제 발생",
            "해결: Entity와 분리된 DTO(record)로 응답을 설계하고, GET/PATCH/DELETE users/me에 HTTP 메서드 시맨틱에 맞는 엔드포인트 구현",
            "결과: 내부 스키마 변경과 API 계약이 독립적으로 관리됨",
          ],
        },
        {
          title: "문제 해결 2 — 외부 API(Meshy AI) 비동기 처리",
          content: [
            "문제: 업로드된 옷 사진을 제품 샷처럼 보정하기 위해 호출하는 Meshy AI의 image-to-image API가 외부 요청 부하에 따라 처리 시간이 11초~123초까지 편차가 커, 동기 방식에선 그동안 화면이 멈춘 것처럼 보임",
            "해결: SSE 기반 비동기 방식으로 전환해 요청 즉시 '처리 중' 상태를 응답하고, 실제 Meshy AI 호출은 백그라운드 스레드에서 처리",
            "결과: 사용자는 대기 없이 바로 다른 화면으로 이동할 수 있게 됐고, 3회 반복 측정으로 처리 시간과 무관하게 응답이 항상 0.02초 이내임을 확인",
          ],
        },
        {
          title: "결과",
          content: [
            "AI 코디 추천 기능을 모바일 앱과 스마트미러(N-Screen) 양쪽에서 확인할 수 있는 화면들",
          ],
          group_key: "result_sticker",
        },
        {
          title: "옷을 촬영해 디지털 옷장에 등록하는 화면",
          content: [],
          blobUrl: "/assets/img/sticker_result3_app_register.webp",
          type: "GALLERY",
          group_key: "result_sticker",
        },
        {
          title: "등록한 옷들을 디지털 옷장에서 확인·관리하는 화면",
          content: [],
          blobUrl: "/assets/img/sticker_result4_app_closet.webp",
          type: "GALLERY",
          group_key: "result_sticker",
        },
        {
          title: "일정과 강조 요소를 입력해 상황에 맞는 코디를 추천받는 화면",
          content: [],
          blobUrl: "/assets/img/sticker_result5_app_context.webp",
          type: "GALLERY",
          group_key: "result_sticker",
        },
        {
          title: "입력한 상황에 맞춰 AI가 추천해준 코디 결과 화면",
          content: [],
          blobUrl: "/assets/img/sticker_result6_app_recommend.webp",
          type: "GALLERY",
          group_key: "result_sticker",
        },
        {
          title: "자연어 입력을 바탕으로 AI가 코디를 추천해주는 스마트미러 화면",
          content: [],
          blobUrl: "/assets/img/sticker_result1_nscreen_analyzing.webp",
          type: "GALLERY",
          group_key: "result_sticker",
        },
        {
          title: "음성(STT)으로 오늘 일정을 말하면 그에 맞는 코디로 자동 변환해주는 스마트미러 화면",
          content: [],
          blobUrl: "/assets/img/sticker_result2_nscreen_stt.webp",
          type: "GALLERY",
          group_key: "result_sticker",
        },
      ],
    },
  ];

  const projectIdByTitle: Record<string, number> = {};

  for (let i = 0; i < projectSeed.length; i++) {
    const p = projectSeed[i];
    const created = await prisma.project.create({
      data: {
        title: p.title,
        sub_title: p.sub_title,
        period: p.period,
        member: p.member,
        skills: p.techNames,
        skill_ids: ids(p.techNames),
        links: p.links,
        row_number: i + 1,
        logo_url: (p as { logo_url?: string }).logo_url,
        preview_clip_url: (p as { preview_clip_url?: string }).preview_clip_url,
        intro_image_url: (p as { intro_image_url?: string }).intro_image_url,
        card_description: (p as { card_description?: string }).card_description,
      },
    });
    projectIdByTitle[p.title] = created.id;

    for (let j = 0; j < p.items.length; j++) {
      const item = p.items[j] as {
        title: string;
        content: string[];
        blobUrl?: string;
        blobUrl2?: string;
        blobUrl3?: string;
        videoUrl?: string;
        group_key?: string;
        imageWidthPercent?: number;
        type?: "TEXT" | "GALLERY" | "COLLAPSIBLE" | "TABLE" | "VIDEO" | "PROBLEM";
      };
      await prisma.projectItem.create({
        data: {
          title: item.title,
          content: item.content,
          blobUrl: item.blobUrl,
          blobUrl2: item.blobUrl2,
          blobUrl3: item.blobUrl3,
          videoUrl: item.videoUrl,
          group_key: item.group_key,
          imageWidthPercent: item.imageWidthPercent,
          type: item.type, // 생략하면 스키마 기본값(TEXT) 적용
          projectId: created.id,
          row_number: j + 1,
        },
      });
    }
  }

  // ── 경력 사항 (시간 순서대로: 활동/업무 + 프로젝트) ─────────────
  const experienceSeed = [
    {
      title: "AoA 기반 단일 앵커 UWB RTLS",
      sub_title: "🏆 전자파학회 제 4회 동상",
      period: "2024.01 ~ 2024.02",
      category: "PROJECT",
      is_active: false,
      techNames: ["C (Embedded)"],
      items: [
        "DS-TWR 거리 측정과 AoA 각도 추정을 융합해 앵커 3개 이상 필요한 기존 삼각측량 방식을 앵커 1개로 단순화한 실시간 2D 위치추적 시스템 구현",
        "CRC 기반 UART 패킷 구조(25B→11B, 56%↓)와 이동평균 필터로 위치 추정 RMSE 22.45cm→16.35cm(27.2%↓) 개선",
        "전자파학회 제4회 대학생 창의설계경진대회 우수논문상(동상) 수상",
      ],
    },
    {
      title: "위상오차제거를 통한 UWB 측위 정확도 개선 및 응용",
      sub_title: "🏆 전자파학회 제 5회 동상 · 논문 게재",
      period: "2024.09 ~ 2025.02",
      category: "PROJECT",
      is_active: false,
      techNames: ["ROS 2"],
      items: [
        "단일 채널 I/Q 위상 복원으로 DS-TWR 거리 오차를 1cm 이하로 개선(90% 샘플이 1cm 이내 오차)",
        "Median+Kalman 이중 필터로 좌표 노이즈 제거, ROS 2 연동 인터랙티브 풍선 게임으로 실시간 동작 검증",
        "논문 제1저자로 한국전자파학회논문지 36.8(2025) 게재 · 전자파학회 제5회 우수논문상(동상) 수상",
      ],
    },
    {
      title: "UWB 거리측정 성능 최적화",
      sub_title: "✦ 논문 게재",
      period: "2024.01 ~ 2025.03",
      category: "PROJECT",
      is_active: false,
      techNames: ["MATLAB"],
      items: [
        "Qorvo DW3000 하드웨어 처리 시간(Treply_min)과 PHY 파라미터를 수식으로 모델링",
        "SS-TWR 오차 방지·DS-TWR 측정 횟수 극대화를 위한 최적 시간 파라미터 선정 방법론 제안, MATLAB·실제 하드웨어로 교차 검증",
        "제1저자로 한국전자파학회논문지 36.3(2025) 게재",
      ],
    },
    {
      title: "삼성청년SW·AI아카데미 14기",
      sub_title: "🎓 임베디드 트랙 수료",
      period: "2025.07 ~ 2026.06",
      category: "WORK",
      is_active: false,
      techNames: ["C++", "Python"],
      items: [
        "임베디드 트랙 입과 — C/리눅스 시스템·네트워크 프로그래밍, 임베디드 Firmware/GUI/IoT, 리눅스 커널 프로그래밍 학습",
        "2025.07~2026.06, 총 1,628시간 교육 과정 이수, SW역량테스트 B등급·Certificate 우수(상위 30%內) 취득",
        "교육 기간 중 RobotPal · NETS · Sticker 프로젝트 3건 수행",
        "삼성전자 네트워크사업부 연계 특화프로젝트(NETS) 우수팀 3등 수상",
      ],
    },
    {
      title: "RobotPal - JETANK 로봇팔 가상 시뮬레이터",
      sub_title: "팀 프로젝트 · C++ / Cross-Platform",
      period: "2025.11 ~ 2025.12",
      category: "PROJECT",
      is_active: false,
      techNames: ["C++"],
      items: [
        "TCP/WebSocket 다형성 구조로 네트워크 계층 추상화, Emscripten 빌드로 Windows/Linux/macOS/Web 동일 코드베이스 배포",
        "네트워크 수신을 전용 스레드로 분리, Thread-safe 큐로 렌더 루프와 데이터 전달해 프레임 드롭 문제 해결",
        "libjpeg-turbo SIMD+워커 스레드 풀로 JPEG 인코딩 시간 0.656ms→0.119ms(약 5.5배) 단축",
      ],
    },
    {
      title: "NETS - 장비 불량 데이터 자동 재분류",
      sub_title: "★ 삼성전자 네트워크 사업부 연계",
      period: "2026.02 ~ 2026.04",
      category: "PROJECT",
      is_active: false,
      techNames: ["FastAPI"],
      items: [
        "BM25+Milvus 하이브리드 검색과 RRF/CC 스코어 결합, Cross-Encoder Re-ranker로 상위 후보 재채점",
        "LLM Judge 기반 최종 재분류 로직으로 모호한 불량 증상 자동 분류, 할루시네이션 최소화",
        "삼성전자 네트워크사업부 연계 특화프로젝트(NETS) 우수팀 3등 수상",
      ],
    },
    {
      title: "Sticker - AI 코디 추천 패션 앱",
      sub_title: "팀 프로젝트 · Backend (REST API · 비동기 메시징)",
      period: "2026.04 ~ 2026.05",
      category: "PROJECT",
      is_active: false,
      techNames: ["Java", "Spring Boot", "PostgreSQL", "Docker", "AWS SQS"],
      items: [
        "회원 프로필·계정 관리 REST API 설계, 회원탈퇴 시 FK 순서를 고려한 계층적 삭제 로직 구현",
        "Entity-DTO 계층 분리 설계로 내부 스키마 변경과 API 계약을 독립적으로 관리",
        "외부 API(Meshy AI) 호출을 SSE 기반 비동기 처리로 전환해 대기 없이 화면 전환, 응답 시간 0.02초 이내 확인",
      ],
    },
  ];

  for (let i = 0; i < experienceSeed.length; i++) {
    const e = experienceSeed[i];
    await prisma.experience.create({
      data: {
        title: e.title,
        sub_title: e.sub_title,
        period: e.period,
        category: e.category,
        is_active: e.is_active,
        index: i + 1,
        items: e.items,
        skill_ids: ids(e.techNames),
        links: [],
      },
    });
  }

  // ── 교육 · 자격 · 논문 ───────────────────────────────────────
  await prisma.education.createMany({
    data: [
      {
        title: "국민대학교 전자공학부 전자시스템공학전공",
        sub_title: "학사",
        period: "2019.03 - 2025.08",
        items: ["학점: 전공 4.33 / 4.5 (전체 4.27 / 4.5)"],
        category: "EDUCATION",
      },
      { title: "OPIc", sub_title: "IH", period: "", items: [], category: "LANGUAGE" },
      { title: "삼성 SW 역량 테스트 B형", sub_title: "Professional", period: "", items: [], category: "SW" },
      { title: "리눅스마스터 2급", sub_title: "", period: "2026.01.02", items: [], category: "CERTIFICATION" },
      { title: "SQL개발자(SQLD)", sub_title: "", period: "2026.09.11", items: [], category: "CERTIFICATION" },
      {
        title: "IEEE 802.15.4z UWB의 거리측정 정확도와 측정시간 최적화",
        sub_title:
          '<a href="https://www.jkiees.org/archive/view_article?pid=jkiees-36-3-274" target="_blank" rel="noopener noreferrer">한국전자파학회논문지 36.3 (2025): 274-282</a>',
        period: "2025.03",
        items: [],
        category: "PUBLICATION",
      },
      {
        title: "단일 채널을 활용한 1cm 이하의 고정밀 UWB 구현 및 응용",
        sub_title:
          '<a href="https://www.jkiees.org/archive/view_article?pid=jkiees-36-8-749" target="_blank" rel="noopener noreferrer">한국전자파학회논문지 36.8 (2025): 749-757</a>',
        period: "2025.08",
        items: [],
        category: "PUBLICATION",
      },
    ],
  });

  console.log("Seed complete:", { skills: Object.keys(skillIdByName).length, projects: projectSeed.length });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
