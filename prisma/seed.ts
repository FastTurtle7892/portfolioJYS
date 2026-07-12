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

  // ── 핵심 역량 (Intro) ──────────────────────────────────────────
  await prisma.intro.createMany({
    data: [
      {
        title: "정밀 신호처리 & 실시간 위치 인식",
        detail:
          "UWB IEEE 802.15.4z 통신에서 <em>DS-TWR</em>, <em>AoA</em>, I/Q 위상 복원을 결합해 거리 오차를 <em>1cm 이하</em>로 줄이는 실시간 측위(RTLS) 시스템을 설계합니다.",
      },
      {
        title: "임베디드-서버 데이터 통신",
        detail:
          "<em>MQTT</em> 토픽 설계·TLS 인증, TCP/WebSocket 추상화로 임베디드 장비와 서버 간 데이터를 안정적으로 주고받는 통신 계층을 구현합니다.",
      },
      {
        title: "서버 플랫폼 & 데이터 파이프라인",
        detail:
          "FastAPI/Spring 기반 REST API, PostgreSQL, Docker로 서버를 구성하고, 하이브리드 검색(BM25+벡터) 기반 RAG 파이프라인으로 실제 산업 데이터를 자동 분류합니다.",
      },
    ],
  });

  // ── 기술 스택 (Skill) ──────────────────────────────────────────
  // blobUrl: devicon/simpleicons/iconify CDN (next.config.js에 도메인 허용됨).
  // 로고가 없는 항목은 ""로 두면 SkillItem이 텍스트 폴백(앞 3글자)으로 표시함.
  const skillSeed: { category: Category; item: string; blobUrl?: string }[] = [
    // 언어
    { category: Category.LANGUAGE, item: "C (Embedded)", blobUrl: "https://api.iconify.design/simple-icons/c.svg" },
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
      sub_title: "DS-TWR + AoA 융합으로 앵커 수를 3개→1개로 줄인 실시간 위치 추적",
      period: "2024.01 ~ 2024.02",
      member: "팀 프로젝트",
      techNames: ["C (Embedded)", "MATLAB"],
      links: [{ label: "데모 영상", href: "https://www.youtube.com/watch?v=SgOs7Dkw7NQ" }],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "기존 삼각측량 방식이 최소 3개 이상의 앵커를 요구하는 것과 달리, DS-TWR 기반 거리 측정과 AoA(Angle of Arrival) 기반 각도 추정을 융합하여 단 1개의 앵커만으로 실시간 2D 위치 추적을 구현.",
          ],
        },
        {
          title: "담당 역할",
          content: ["DS-TWR + AoA 융합 알고리즘 설계, 펌웨어 구현, MATLAB 실시간 시각화 개발"],
        },
        {
          title: "문제 해결 1 — 앵커 수 축소와 패킷 절감",
          content: [
            "문제: 기존 삼각측량 방식은 앵커 3개 이상이 필요해 설치 제약과 앵커 간 통신 오버헤드가 컸음",
            "해결: DS-TWR 거리 측정과 AoA 각도 추정을 융합해 앵커 1개만으로 2D 좌표를 산출하도록 설계",
            "결과: 앵커 수 3개→1개, 패킷 교환 횟수 11회→3회로 약 73% 감소",
          ],
        },
        {
          title: "문제 해결 2 — Y축 위치 오차 보정",
          content: [
            "문제: AoA 각도 추정 특성상 Y축 방향 노이즈가 커 좌표가 순간적으로 튀는 현상 발생",
            "해결: Kalman Filter를 적용해 추정 좌표를 실시간으로 스무딩",
            "결과: 실시간 추적 안정성 확보, MATLAB UART 연동으로 즉시 시각화",
          ],
        },
        { title: "AoA 기반 단일 앵커 RTLS 시스템 구성", content: [], blobUrl: "/assets/img/aoa_system.png" },
        { title: "하드웨어 실험 환경", content: [], blobUrl: "/assets/img/aoa_experiment.png" },
        { title: "신호 처리 파이프라인 (DS-TWR/AoA → 좌표 변환)", content: [], blobUrl: "/assets/img/aoa_process.png" },
        { title: "실험 결과 — 실시간 위치 추적", content: [], blobUrl: "/assets/img/aoa_result.png" },
        { title: "성과", content: ["전자파학회 제4회 대학생 창의설계경진대회 우수논문상(동상) 수상"] },
      ],
    },
    {
      title: "위상오차제거를 통한 UWB 측위 정확도 개선 및 응용",
      sub_title: "I/Q 위상 복원으로 거리 오차 1cm 이하 달성, ROS 기반 실시간 RTLS",
      period: "2024.09 ~ 2025.02",
      member: "5인 팀 (장윤석, 배윤수, 박효준, 정현우, 한수민, 장병준)",
      techNames: ["C (Embedded)", "ROS 2", "Python", "OpenCV"],
      links: [{ label: "데모 영상", href: "https://www.youtube.com/watch?v=zzRW9kg5rdE" }],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "UWB(초광대역) 통신의 단일 주파수 채널에서 I/Q 데이터로부터 위상 정보를 복원하여 DS-TWR의 거리 측정 오차를 기존 수 cm에서 1cm 이하로 개선한 고정밀 실시간 측위 시스템(RTLS).",
          ],
        },
        {
          title: "담당 역할",
          content: ["위상 복원 알고리즘 설계 및 구현, 거리 보정 수식 도출, 필터링 파이프라인 구축 (제1저자)"],
        },
        {
          title: "문제 해결 1 — 위상 복원으로 거리 오차 개선",
          content: [
            "문제: 단일 주파수 채널만 사용하는 환경에서 위상 모호성 때문에 DS-TWR 거리값만으로는 수 cm 수준의 오차가 발생",
            "해결: I/Q 데이터로부터 위상 정보를 복원하는 알고리즘을 설계하고 DS-TWR 거리값과 융합",
            "결과: 거리 측정 오차를 1cm 이하로 개선",
          ],
        },
        {
          title: "문제 해결 2 — 좌표 노이즈 제거",
          content: [
            "문제: 위상 기반 보정 이후에도 순간적인 노이즈로 좌표가 튀는 현상이 남아있음",
            "해결: Median 필터와 Kalman 필터를 이중으로 적용해 좌표를 정제",
            "결과: 안정적인 실시간 좌표 산출, Python Pygame 기반 인터랙티브 시각화로 동작 검증",
          ],
        },
        {
          title: "성과",
          content: [
            "논문 제1저자로 한국전자파학회논문지 36.8 (2025): 749-757 게재",
            "전자파학회 제5회 대학생 창의설계경진대회 우수논문상(동상) 수상",
          ],
        },
      ],
    },
    {
      title: "IEEE 802.15.4z UWB 거리측정 성능 최적화",
      sub_title: "SS-TWR / DS-TWR 시간 파라미터 최적화로 정확도·속도 동시 개선",
      period: "2025.03",
      member: "팀 프로젝트",
      techNames: ["C (Embedded)", "MATLAB"],
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "UWB IC(Qorvo DW3000)의 실제 하드웨어 처리 시간과 PHY 파라미터(프리앰블 길이 등)에 따른 패킷 길이를 정밀 분석하여, SS-TWR의 거리 오차를 방지하고 DS-TWR의 측정 횟수를 극대화하는 최적 시간 파라미터 선정 방법을 제안.",
          ],
        },
        {
          title: "담당 역할",
          content: ["TWR 프로토콜 분석, 하드웨어 처리 시간 측정, 최적 파라미터 계산 방법론 개발 및 검증"],
        },
        {
          title: "문제 해결 1 — SS-TWR 오차 발생 조건 규명",
          content: [
            "문제: SS-TWR 방식에서 특정 조건에서만 거리 오차가 급격히 커지는데 원인이 불명확했음",
            "해결: UWB IC의 하드웨어 처리 시간(Treply_min)을 정밀 측정·모델링해 Treply ≥ Treply_min 조건 미충족 시 오차가 급증함을 규명",
            "결과: 오차 없는 SS-TWR 파라미터 설정 가이드라인 도출",
          ],
        },
        {
          title: "문제 해결 2 — DS-TWR 측정 횟수 극대화",
          content: [
            "문제: 정확도를 위해 Treply를 늘리면 단위 시간당 측정 가능 횟수가 줄어드는 트레이드오프 존재",
            "해결: 최적 Treply 계산 방법론을 개발하고 MATLAB 시뮬레이션과 실제 하드웨어 실험으로 교차 검증",
            "결과: 정확도를 유지하며 단위 시간 내 측정 횟수를 극대화, 이론·실험 결과 일치 확인",
          ],
        },
        { title: "UWB 거리측정 시스템 개요", content: [], blobUrl: "/assets/img/ranging_overview.png" },
        { title: "SS-TWR Treply 최적화 실험 결과", content: [], blobUrl: "/assets/img/ranging_result.png" },
        { title: "성과", content: ["한국전자파학회논문지 36.3 (2025): 274-282 게재"] },
      ],
    },
    {
      title: "RobotPal - JETANK 로봇팔 가상 시뮬레이터",
      sub_title: "네트워크 계층 추상화(TCP/WebSocket 다형성) 및 싱글 스레드 → 멀티 스레드 리팩토링",
      period: "2025.11 ~ 2025.12",
      member: "팀 프로젝트",
      techNames: ["C++", "Docker"],
      links: [{ label: "라이브 데모", href: "https://fastturtle7892.github.io/RobotPal/" }],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "JETANK 로봇팔의 훈련·테스트를 위한 크로스플랫폼 가상 시뮬레이션 환경. 현실 세계에서의 물리적 제약·안전 문제를 가상 환경으로 해결하고, Emscripten을 통해 웹 브라우저에서도 동일하게 구동되는 것이 특징. 담당 파트는 네트워크 계층 추상화 설계와 싱글 스레드 구조를 멀티 스레드로 전환하는 리팩토링.",
          ],
        },
        {
          title: "담당 역할",
          content: [
            "네트워크 계층 추상화 설계 (TCP / WebSocket 다형성 구조), 싱글 스레드 → 멀티 스레드 리팩토링 (Thread-safe 수신 큐 구현)",
          ],
        },
        {
          title: "문제 해결 1 — 네트워크 계층 추상화",
          content: [
            "문제: TCP와 WebSocket을 각각 다른 방식으로 다뤄야 해 플랫폼별 분기 코드가 늘어나는 구조였음",
            "해결: NetworkTransport 추상 인터페이스를 설계하고 TcpNetworkTransport / WebSocketTransport로 다형성 구현",
            "결과: Windows / Linux / macOS / Web을 동일 코드베이스로 배포 가능해짐 (Emscripten 빌드)",
          ],
        },
        {
          title: "문제 해결 2 — 싱글 스레드 → 멀티 스레드 리팩토링",
          content: [
            "문제: 싱글 스레드 구조에서 네트워크 수신 대기 중 프레임 드롭이 발생",
            "해결: 전용 네트워크 스레드를 분리하고 Thread-safe lock-free NetworkQueue로 게임 루프 스레드와 데이터 전달",
            "결과: 프레임 드롭 문제 해결, 안정적인 실시간 렌더링 확보",
          ],
        },
        { title: "RobotPal 데모 영상", content: [], blobUrl: "/assets/img/robotpal_demo.webp" },
        { title: "시뮬레이터 실행 화면", content: [], blobUrl: "/assets/img/robotpal_screenshot.png" },
      ],
    },
    {
      title: "TowingCar - 공항 항공기 견인 관제 시스템",
      sub_title: "Jetson Orin 자율주행 제어와 MQTT 차량-서버 통신 구현",
      period: "2026.01 ~ 2026.02",
      member: "팀 프로젝트 (Frontend · Backend · Embedded · AI 파트 분담)",
      techNames: ["Python", "ROS 2", "MQTT"],
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "공항 내 항공기 견인 작업을 자동화하는 통합 관제 플랫폼. 관제탑(Web), 자율주행 토잉카(Jetson Orin), AI 비전으로 구성. 담당 파트는 Jetson Orin 임베디드 전반 — ROS2 기반 자율주행 제어, MQTT 차량-서버 통신, AI 비전 마샬러 동작인식. STM32 하드웨어와 Java 백엔드는 별도 담당자가 구현.",
          ],
        },
        {
          title: "담당 역할",
          content: [
            "Jetson Orin 임베디드 파트 전담 — ROS2 자율주행 제어, MQTT 통신 계층 구현, AI 비전 마샬러 동작인식 개발. STM32 하드웨어, Java 백엔드는 미담당.",
          ],
        },
        {
          title: "문제 해결 1 — MQTT 차량-서버 통신 설계",
          content: [
            "문제: 다수 차량으로 확장 시 토픽 충돌, 인증되지 않은 접근, 메시지 유실 우려가 있는 구조였음",
            "해결: 차량별 topic 네임스페이싱, TLS 인증, ACK 패턴을 적용한 통신 계층 설계",
            "결과: 다중 차량 확장이 가능한 안정적인 MQTT 통신 계층 구현",
          ],
        },
        {
          title: "문제 해결 2 — AI 비전 기반 마샬러 동작인식",
          content: [
            "문제: 관제 신호 없이도 마샬러(유도요원)의 수신호를 차량이 실시간으로 인식해 반응해야 함",
            "해결: 카메라 영상 기반 AI 비전 모델로 수신호 동작을 분류하고, 상태머신(IDLE/DOCKING/DRIVING/RELEASE/PARK/MARSHAL/STOP)에 제어 명령으로 연동",
            "결과: 수신호 인식→주행 상태 전환 자동화",
          ],
        },
      ],
    },
    {
      title: "NETS - 장비 불량 데이터 자동 재분류 (RAG)",
      sub_title: "하이브리드 검색(BM25 + Milvus) + LLM Judge RAG 파이프라인으로 모호한 불량 증상 자동 재분류",
      period: "2026.02 ~ 2026.04",
      member: "삼성전자 네트워크 사업부 연계 팀 프로젝트 (Frontend · Backend · AI 파트 분담)",
      techNames: ["Python", "FastAPI", "Docker"],
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "기지국 장비의 수리(RMA) 데이터 중 '기타', '기타 불량' 등 분류가 모호한 증상을 과거 정상 분류 데이터 기반으로 자동 재분류하는 RAG 파이프라인. 순수 벡터 검색의 한계를 극복하기 위해 하이브리드 검색(BM25 + Milvus)과 LLM Judge를 결합, 할루시네이션을 최소화. 담당 파트는 reclassify 모듈 전담 설계 및 구현.",
          ],
        },
        {
          title: "담당 역할",
          content: [
            "reclassify 모듈 전담 — 하이브리드 검색 파이프라인(BM25 + Milvus) 설계, RRF / CC 스코어 결합 구현, Cross-Encoder Re-ranker 플러그인 구조 설계, LLM Judge 재분류 로직 구현",
          ],
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
      sub_title: "REST API 설계와 PostgreSQL 기반 마이페이지 도메인 서버 개발",
      period: "2026.04 ~ 2026.05",
      member: "팀 프로젝트 (Backend · mypage 도메인 담당)",
      techNames: ["Java", "Spring Boot", "PostgreSQL", "Docker", "Gradle"],
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "디지털 옷장과 AI 코디 추천을 결합한 패션 매칭 서비스. 담당 파트는 마이페이지(mypage) 도메인 — 프로필 조회·수정·회원탈퇴 REST API와 PostgreSQL 기반 데이터 정합성 처리, Docker 멀티스테이지 빌드 구성을 전담.",
          ],
        },
        {
          title: "담당 역할",
          content: ["마이페이지 도메인 REST API 설계, 회원탈퇴 시 FK 순서를 고려한 계층적 삭제 로직 구현, Docker 멀티스테이지 빌드 구성"],
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
          title: "문제 해결 2 — 회원탈퇴 캐스케이드 삭제 순서",
          content: [
            "문제: CASCADE가 설정되지 않은 테이블이 있어 삭제 순서를 잘못 잡으면 FK 제약으로 탈퇴 처리가 실패",
            "해결: FK 참조 방향을 분석해 wardrobe_items → item_measurements → push_tokens 순으로 명시적 삭제 로직 구현",
            "결과: 회원탈퇴 시 데이터 정합성 확보",
          ],
        },
        {
          title: "문제 해결 3 — Docker 배포 경량화",
          content: [
            "문제: 단일 스테이지 빌드는 빌드 도구까지 이미지에 포함돼 크기가 크고 배포가 느림",
            "해결: Gradle 멀티스테이지 Dockerfile(builder → JRE 런타임)로 구성하고 BuildKit 캐시 마운트 적용",
            "결과: 배포 이미지 경량화 및 빌드 시간 단축",
          ],
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
      },
    });
    projectIdByTitle[p.title] = created.id;

    for (let j = 0; j < p.items.length; j++) {
      const item = p.items[j] as { title: string; content: string[]; blobUrl?: string };
      await prisma.projectItem.create({
        data: {
          title: item.title,
          content: item.content,
          blobUrl: item.blobUrl,
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
        "DS-TWR 기반 거리 측정과 AoA 각도 추정을 융합해 앵커 1개로 실시간 2D 위치 추적 구현",
        "앵커 수 3→1개로 축소, 패킷 교환 횟수 11회→3회로 약 73% 감소",
        "MATLAB UART 기반 실시간 위치 시각화 개발",
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
        "I/Q 위상 복원 알고리즘으로 DS-TWR 거리 오차를 1cm 이하로 개선",
        "Median + Kalman 이중 필터로 좌표 노이즈 제거",
        "논문 제1저자로 한국전자파학회논문지 36.8(2025) 게재",
        "전자파학회 제5회 대학생 창의설계경진대회 우수논문상(동상) 수상",
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
        "UWB IC 하드웨어 처리 시간(Treply_min) 정밀 측정 및 모델링",
        "SS-TWR/DS-TWR 최적 시간 파라미터 선정 방법론 제안",
        "MATLAB 시뮬레이션과 실제 하드웨어 검증으로 이론·실험 일치 확인",
        "한국전자파학회논문지 36.3(2025) 게재",
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
        "교육 기간 중 RobotPal · TowingCar · NETS · Sticker 프로젝트 4건 수행",
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
        "TCP Socket / WebSocket 다형성 구조로 네트워크 계층 추상화 설계",
        "싱글 스레드에서 멀티 스레드로 리팩토링해 프레임 드롭 문제 해결",
        "Thread-safe 큐로 네트워크 스레드와 게임 루프 스레드 간 데이터 전달 구현",
        "Emscripten 빌드로 Windows/Linux/macOS/Web 동일 코드베이스 배포",
      ],
    },
    {
      title: "TowingCar - 공항 항공기 견인 관제 시스템",
      sub_title: "팀 프로젝트 · Jetson Orin 임베디드 / 자율주행",
      period: "2026.01 ~ 2026.02",
      category: "PROJECT",
      is_active: false,
      techNames: ["ROS 2", "MQTT"],
      items: [
        "Jetson Orin ROS2 노드로 LiDAR 센서 데이터 처리 및 자율주행 제어",
        "MQTT 토픽 네임스페이싱·TLS 인증·ACK 패턴으로 차량-서버 통신 구현",
        "상태머신(IDLE/DOCKING/DRIVING/RELEASE/PARK/MARSHAL/STOP)으로 주행 상태 관리",
        "AI 비전 기반 마샬러(유도요원) 동작 인식 기능 구현",
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
        "Milvus 벡터 검색과 BM25 키워드 검색을 결합한 하이브리드 파이프라인 설계",
        "RRF/CC 스코어 결합 및 Cross-Encoder 재순위화 구조 구현",
        "LLM 기반 최종 재분류 로직으로 모호 불량 증상 자동 분류",
        "삼성전자 네트워크사업부 연계 우수팀 3등 수상",
      ],
    },
    {
      title: "Sticker - AI 코디 추천 패션 앱",
      sub_title: "팀 프로젝트 · Backend (mypage 도메인)",
      period: "2026.04 ~ 2026.05",
      category: "PROJECT",
      is_active: false,
      techNames: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
      items: [
        "마이페이지 도메인 REST API 설계 및 구현",
        "PostgreSQL 기반 회원탈퇴 캐스케이드 삭제 순서 설계",
        "Entity와 DTO 분리로 API 응답과 내부 스키마 독립",
        "Gradle 멀티스테이지 Docker 빌드로 배포 이미지 경량화",
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
      {
        title: "IEEE 802.15.4z UWB의 거리측정 정확도와 측정시간 최적화",
        sub_title:
          '<a href="https://www.jkiees.org/archive/view_article?pid=jkiees-36-3-274" target="_blank" rel="noopener noreferrer">한국전자파학회논문지 36.3 (2025): 274-282</a>',
        period: "2025.03",
        items: [
          '<a href="https://www.jkiees.org/archive/view_article?pid=jkiees-36-3-274" target="_blank" rel="noopener noreferrer">https://www.jkiees.org/archive/view_article?pid=jkiees-36-3-274</a>',
          "UWB IC의 하드웨어 처리 시간과 PHY 파라미터 기반 시간 파라미터 최적화 연구",
        ],
        category: "PUBLICATION",
      },
      {
        title: "단일 채널을 활용한 1cm 이하의 고정밀 UWB 구현 및 응용",
        sub_title:
          '<a href="https://www.jkiees.org/archive/view_article?pid=jkiees-36-8-749" target="_blank" rel="noopener noreferrer">한국전자파학회논문지 36.8 (2025): 749-757</a>',
        period: "2025.08",
        items: [
          '<a href="https://www.jkiees.org/archive/view_article?pid=jkiees-36-8-749" target="_blank" rel="noopener noreferrer">https://www.jkiees.org/archive/view_article?pid=jkiees-36-8-749</a>',
          "I/Q 데이터 위상 복원을 통한 DS-TWR 거리 오차 1cm 이하 개선 연구",
        ],
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
