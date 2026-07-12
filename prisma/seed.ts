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
        title: "정밀 신호처리 & 위치 인식",
        detail:
          "UWB IEEE 802.15.4z 통신에서 <em>DS-TWR</em>, <em>AoA</em>, I/Q 위상 복원을 결합해 거리 오차를 <em>1cm 이하</em>로 줄이는 실시간 측위(RTLS) 시스템을 설계합니다.",
      },
      {
        title: "임베디드 시스템 설계",
        detail:
          "STM32 FreeRTOS 멀티태스크와 FSM 구조로 안전이 중요한 하드웨어를 제어하고, Nordic nRF52840·Qorvo DW3000 기반 저수준 펌웨어를 직접 구현합니다.",
      },
      {
        title: "자율주행 & AI 파이프라인",
        detail:
          "Jetson Orin과 ROS 2로 자율주행 임베디드 시스템을 제어하고, 하이브리드 검색(BM25+벡터) 기반 RAG 파이프라인으로 실제 산업 데이터를 자동 분류합니다.",
      },
    ],
  });

  // ── 기술 스택 (Skill) ──────────────────────────────────────────
  const skillSeed: { category: Category; item: string }[] = [
    // 임베디드 / 하드웨어
    { category: Category.FRONTEND, item: "C (Embedded)" },
    { category: Category.FRONTEND, item: "C++" },
    { category: Category.FRONTEND, item: "STM32" },
    { category: Category.FRONTEND, item: "FreeRTOS" },
    { category: Category.FRONTEND, item: "Jetson Orin" },
    { category: Category.FRONTEND, item: "Nordic nRF52840" },
    { category: Category.FRONTEND, item: "Qorvo DW3000" },
    { category: Category.FRONTEND, item: "Qorvo DW3110" },
    { category: Category.FRONTEND, item: "IEEE 802.15.4z" },
    // 소프트웨어 / 프레임워크
    { category: Category.FRONTEND_LIBRARY, item: "Python" },
    { category: Category.FRONTEND_LIBRARY, item: "ROS 2" },
    { category: Category.FRONTEND_LIBRARY, item: "FastAPI" },
    { category: Category.FRONTEND_LIBRARY, item: "LangChain" },
    { category: Category.FRONTEND_LIBRARY, item: "Docker" },
    { category: Category.FRONTEND_LIBRARY, item: "MATLAB" },
    { category: Category.FRONTEND_LIBRARY, item: "Pygame" },
    { category: Category.FRONTEND_LIBRARY, item: "OpenCV" },
    // 알고리즘 / 프로토콜
    { category: Category.ENV, item: "FSM" },
    { category: Category.ENV, item: "RAG / Hybrid Search" },
    { category: Category.ENV, item: "Multi-threading" },
    { category: Category.ENV, item: "DS-TWR" },
    { category: Category.ENV, item: "SS-TWR" },
    { category: Category.ENV, item: "AoA" },
    { category: Category.ENV, item: "Kalman Filter" },
    { category: Category.ENV, item: "Signal Processing" },
  ];

  const skillIdByName: Record<string, number> = {};
  for (const s of skillSeed) {
    const created = await prisma.skill.create({
      data: { category: s.category, item: s.item, items: [], blobUrl: "" },
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
      techNames: ["C (Embedded)", "Nordic nRF52840", "Qorvo DW3110", "MATLAB", "IEEE 802.15.4z"],
      links: [{ label: "데모 영상", href: "https://www.youtube.com/watch?v=SgOs7Dkw7NQ" }],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "기존 삼각측량 방식이 최소 3개 이상의 앵커를 요구하는 것과 달리, DS-TWR 기반 거리 측정과 AoA(Angle of Arrival) 기반 각도 추정을 융합하여 단 1개의 앵커만으로 실시간 2D 위치 추적을 구현.",
          ],
        },
        {
          title: "역할 / 기여",
          content: ["DS-TWR + AoA 융합 알고리즘 설계, 펌웨어 구현, MATLAB 실시간 시각화 개발"],
        },
        {
          title: "주요 구현 내용",
          content: [
            "DS-TWR(Double-Sided Two-Way Ranging)으로 정밀 거리 R 측정",
            "안테나 배열 위상차(Δφ) 기반 AoA 각도 θ 추정",
            "거리 R + 각도 θ 융합으로 2D 좌표 실시간 산출",
            "XR-170 고지향성 안테나를 활용한 AoA 정확도 향상",
            "MATLAB UART 기반 실시간 위치 시각화",
            "Kalman Filter 적용으로 Y축 오차 보정",
          ],
        },
        { title: "AoA 기반 단일 앵커 RTLS 시스템 구성", content: [], blobUrl: "/assets/img/aoa_system.png" },
        { title: "하드웨어 실험 환경", content: [], blobUrl: "/assets/img/aoa_experiment.png" },
        { title: "실험 결과 — 실시간 위치 추적", content: [], blobUrl: "/assets/img/aoa_result.png" },
      ],
    },
    {
      title: "고정밀 UWB 위상 오차 보정 시스템",
      sub_title: "I/Q 위상 복원으로 거리 오차 1cm 이하 달성, ROS 기반 실시간 RTLS",
      period: "2024.09 ~ 2025.02",
      member: "5인 팀 (장윤석, 배윤수, 박효준, 정현우, 한수민, 장병준)",
      techNames: ["C (Embedded)", "Nordic nRF52840", "Qorvo DW3000", "ROS 2", "Python", "Pygame", "OpenCV", "Kalman Filter"],
      links: [{ label: "데모 영상", href: "https://www.youtube.com/watch?v=zzRW9kg5rdE" }],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "UWB(초광대역) 통신의 단일 주파수 채널에서 I/Q 데이터로부터 위상 정보를 복원하여 DS-TWR의 거리 측정 오차를 기존 수 cm에서 1cm 이하로 개선한 고정밀 실시간 측위 시스템(RTLS).",
          ],
        },
        {
          title: "역할 / 기여",
          content: ["위상 복원 알고리즘 설계 및 구현, 거리 보정 수식 도출, 필터링 파이프라인 구축 (제 1저자)"],
        },
        {
          title: "주요 구현 내용",
          content: [
            "I/Q 데이터 기반 위상 복원(Phase Recovery) 알고리즘",
            "DS-TWR 거리값과 위상 정보 융합으로 1cm 이하 정확도 달성",
            "파장 모호성(Ambiguity) 해결을 통한 안정적 거리 보정",
            "Median + Kalman 이중 필터로 좌표 노이즈 제거",
            "ROS 2 기반 다중 앵커(4개) 실시간 데이터 수집 및 시각화",
            "Python Pygame 기반 인터랙티브 위치 시각화 게임 구현",
          ],
        },
        { title: "관련 논문", content: ["한국전자파학회논문지 36.8 (2025): 749-756"] },
      ],
    },
    {
      title: "IEEE 802.15.4z UWB 거리측정 성능 최적화",
      sub_title: "SS-TWR / DS-TWR 시간 파라미터 최적화로 정확도·속도 동시 개선",
      period: "2025.03",
      member: "팀 프로젝트",
      techNames: ["C (Embedded)", "Nordic nRF52840", "Qorvo DW3000", "MATLAB", "IEEE 802.15.4z", "SS-TWR", "DS-TWR"],
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "UWB IC(Qorvo DW3000)의 실제 하드웨어 처리 시간과 PHY 파라미터(프리앰블 길이 등)에 따른 패킷 길이를 정밀 분석하여, SS-TWR의 거리 오차를 방지하고 DS-TWR의 측정 횟수를 극대화하는 최적 시간 파라미터 선정 방법을 제안.",
          ],
        },
        {
          title: "역할 / 기여",
          content: ["TWR 프로토콜 분석, 하드웨어 처리 시간 측정, 최적 파라미터 계산 방법론 개발 및 검증"],
        },
        {
          title: "주요 구현 내용",
          content: [
            "UWB IC 하드웨어 처리 시간(Treply_min) 정밀 측정 및 모델링",
            "PHY 파라미터(프리앰블 길이)에 따른 패킷 시간 자동 계산 공식 도출",
            "SS-TWR: Treply ≥ Treply_min 조건 미충족 시 오차 급증 현상 규명",
            "DS-TWR: 최적 Treply 설정으로 단위 시간 내 측정 횟수 극대화",
            "MATLAB 시뮬레이션 + 실제 하드웨어 검증으로 이론·실험 일치 확인",
            "Preamble 128 vs 1024 설정별 성능 비교 분석",
          ],
        },
        { title: "UWB 거리측정 시스템 개요", content: [], blobUrl: "/assets/img/ranging_overview.png" },
        { title: "SS-TWR Treply 최적화 실험 결과", content: [], blobUrl: "/assets/img/ranging_result.png" },
        { title: "관련 논문", content: ["한국전자파학회논문지 36.3 (2025): 274-282"] },
      ],
    },
    {
      title: "RobotPal — JETANK 로봇팔 가상 시뮬레이터",
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
          title: "역할 / 기여",
          content: [
            "네트워크 계층 추상화 설계 (TCP / WebSocket 다형성 구조), 싱글 스레드 → 멀티 스레드 리팩토링 (Thread-safe 수신 큐 구현)",
          ],
        },
        {
          title: "주요 구현 내용",
          content: [
            "NetworkTransport 추상 인터페이스 설계 — TcpNetworkTransport / WebSocketTransport 구현체 다형성 적용",
            "NetworkTransport::Create() 팩토리 패턴으로 런타임에 전송 방식 교체 가능한 구조",
            "NetworkQueue (Thread-safe lock-free 큐)로 네트워크 스레드 ↔ 게임 루프 스레드 데이터 전달",
            "기존 싱글 스레드 구조에서 수신 대기 시 발생하던 프레임 드롭 문제를 전용 네트워크 스레드 분리로 해결",
            "NetworkEngine이 flecs ECS 월드에 ConnectionStatus 컴포넌트로 연결 상태를 등록·관리",
            "Emscripten 빌드 지원으로 Windows / Linux / macOS / Web 모두 동일 코드베이스로 배포",
          ],
        },
      ],
    },
    {
      title: "스마트 토잉카 관제 시스템",
      sub_title: "STM32 FreeRTOS 멀티태스크 FSM 설계로 공항 항공기 자율 견인 임베디드 전담 구현",
      period: "2026.01 ~ 2026.02",
      member: "팀 프로젝트 (Frontend · Backend · Embedded · AI 파트 분담)",
      techNames: ["STM32", "FreeRTOS", "Python", "ROS 2", "Jetson Orin"],
      links: [],
      items: [
        {
          title: "프로젝트 개요",
          content: [
            "공항 내 항공기 견인 작업을 자동화하는 통합 관제 플랫폼. 관제탑(Web), 자율주행 토잉카(Jetson Orin), STM32 하드웨어, AI 비전으로 구성. 담당 파트는 임베디드 전반 — STM32 FreeRTOS 멀티태스크 FSM 설계 및 Jetson Orin ROS2 제어. A-star 경로 계획(PathPlanner)과 STM32 하드웨어 드라이버 일부는 별도 담당자가 구현.",
          ],
        },
        {
          title: "역할 / 기여",
          content: [
            "임베디드 파트 전담 — STM32 FreeRTOS 멀티태스크 FSM 구조 설계 (controlTask / safetyTask / dockTask / uartRxTask), Jetson Orin ROS2 노드 제어. A-star 알고리즘, STM32 기본 HAL 드라이버는 미담당.",
          ],
        },
        {
          title: "주요 구현 내용",
          content: [
            "STM32 FreeRTOS 기반 멀티태스크 아키텍처 — controlTask / safetyTask / dockTask / uartRxTask 독립 실행",
            "FSM(Finite State Machine) 패턴 — safetyTask: OK / TIMEOUT / ESTOP / DISABLED 4가지 상태로 안전 우선 전환",
            "safetyTask HardStop: 모터 즉시 정지 + 도킹 암 안전 자세 복귀 원자적 처리",
            "dockTask FSM: FLAG_DOCK_START / FLAG_DOCK_ABORT 플래그 기반 도킹 시퀀스 상태 전이",
            "controlTask: osMessageQueue 기반 명령 큐로 실시간 속도·조향 업데이트 및 타임아웃 감지",
            "Jetson Orin ROS2 노드(orin_car)로 LiDAR 센서 데이터 처리 및 상위 자율주행 제어 담당",
          ],
        },
      ],
    },
    {
      title: "NETS — 장비 불량 데이터 자동 재분류 (RAG)",
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
          title: "역할 / 기여",
          content: [
            "reclassify 모듈 전담 — 하이브리드 검색 파이프라인(BM25 + Milvus) 설계, RRF / CC 스코어 결합 구현, Cross-Encoder Re-ranker 플러그인 구조 설계, LLM Judge 재분류 로직 구현",
          ],
        },
        {
          title: "주요 구현 내용",
          content: [
            "하이브리드 검색: Milvus 벡터 DB(임베딩 유사도) + BM25(키워드) 동시 검색으로 단순 벡터 검색의 누락 보완",
            "RRF(Reciprocal Rank Fusion): 벡터·키워드 결과 순위에 페널티를 적용해 수학적으로 합산 (기본 모드, 고속)",
            "CC(Convex Combination): 거리/유사도 값을 0~1 정규화 후 가중합 (RRF 대비 점수 분포 차별화)",
            "Cross-Encoder Re-ranker 플러그인 구조 — rrf_reranker / cc_reranker 모드로 On/Off 전환, 상위 30건 딥러닝 정밀 재채점",
            "LLM Judge: 노이즈 필터링(1차 Python 차단) 후 정제된 상위 5개 후보를 LLM이 분석해 최종 카테고리 1건 추출",
            "FastAPI + SQLite로 재분류 이력 영구 기록 및 관리자 승인 워크플로 구현",
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
      techNames: ["C (Embedded)", "Nordic nRF52840", "Qorvo DW3110", "AoA"],
      items: ["DS-TWR + AoA 융합으로 단일 앵커 실시간 위치 추적 구현", "전자파학회 제 4회 동상 수상"],
    },
    {
      title: "고정밀 UWB 위상 오차 보정 (Phase Correction)",
      sub_title: "🏆 전자파학회 제 5회 동상 · 논문 게재",
      period: "2024.09 ~ 2025.02",
      category: "PROJECT",
      is_active: false,
      techNames: ["Qorvo DW3000", "ROS 2", "Kalman Filter"],
      items: ["I/Q 위상 복원으로 DS-TWR 거리 오차 1cm 이하 개선", "제 1저자로 논문 게재 및 전자파학회 동상 수상"],
    },
    {
      title: "UWB 거리측정 성능 최적화",
      sub_title: "✦ 논문 게재",
      period: "2024.01 ~ 2025.03",
      category: "PROJECT",
      is_active: false,
      techNames: ["MATLAB", "SS-TWR", "DS-TWR"],
      items: ["UWB IC 하드웨어 처리 시간 분석 기반 최적 시간 파라미터 선정 방법 제안", "한국전자파학회논문지 게재"],
    },
    {
      title: "SSAFY 14기 임베디드 트랙",
      sub_title: undefined,
      period: "2025.07 ~",
      category: "WORK",
      is_active: true,
      techNames: ["C++", "Python"],
      items: ["삼성 청년 SW·AI 아카데미 임베디드 트랙 교육 과정 수료 중"],
    },
    {
      title: "RobotPal — JETANK 로봇팔 가상 시뮬레이터",
      sub_title: "팀 프로젝트 · C++ / Cross-Platform",
      period: "2025.11 ~ 2025.12",
      category: "PROJECT",
      is_active: false,
      techNames: ["C++", "Multi-threading"],
      items: ["네트워크 계층 추상화 및 싱글 스레드 → 멀티 스레드 리팩토링 담당"],
    },
    {
      title: "스마트 토잉카 관제 시스템",
      sub_title: "팀 프로젝트 · 임베디드 / 자율주행",
      period: "2026.01 ~ 2026.02",
      category: "PROJECT",
      is_active: false,
      techNames: ["STM32", "FreeRTOS", "Jetson Orin"],
      items: ["STM32 FreeRTOS 멀티태스크 FSM 설계로 공항 항공기 자율 견인 임베디드 전담 구현"],
    },
    {
      title: "NETS — 장비 불량 데이터 자동 재분류",
      sub_title: "★ 삼성전자 네트워크 사업부 연계",
      period: "2026.02 ~ 2026.04",
      category: "PROJECT",
      is_active: false,
      techNames: ["FastAPI", "RAG / Hybrid Search"],
      items: ["하이브리드 검색(BM25+Milvus) + LLM Judge RAG 파이프라인으로 모호 불량 증상 자동 재분류"],
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
      { title: "OPIc", sub_title: "IH", period: "", items: [], category: "CERTIFICATION" },
      { title: "삼성 SW 역량 테스트 B형", sub_title: "Professional", period: "", items: [], category: "CERTIFICATION" },
      { title: "리눅스마스터 2급", sub_title: "", period: "2026.01.02 취득", items: [], category: "CERTIFICATION" },
      {
        title: "IEEE 802.15.4z UWB의 거리측정 정확도와 측정시간 최적화",
        sub_title: "한국전자파학회논문지 36.3 (2025): 274-282",
        period: "2025",
        items: ["UWB IC의 하드웨어 처리 시간과 PHY 파라미터 기반 시간 파라미터 최적화 연구"],
        category: "PUBLICATION",
      },
      {
        title: "단일 채널을 활용한 1cm 이하의 고정밀 UWB 구현 및 응용",
        sub_title: "한국전자파학회논문지 36.8 (2025): 749-756",
        period: "2025",
        items: ["I/Q 데이터 위상 복원을 통한 DS-TWR 거리 오차 1cm 이하 개선 연구"],
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
