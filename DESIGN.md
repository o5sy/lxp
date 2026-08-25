# Design System — AI 맞춤 실습 생성기 (practice-generator)

## Product Context
- **What this is:** 부트캠프 학습자가 방금 배운 개념을 골라 개인화된 코딩 실습을 받고, 같은 화면에서 실행(Sandpack)하고, AI 피드백을 받는 단일 화면 웹앱.
- **Who it's for:** 프론트엔드 개발 부트캠프 학습자로 시작 (직무 무관 확장을 염두에 두되, 구조만 확장 가능하게 설계).
- **Space/industry:** 개발자 학습 도구 / AI 코딩 어시스턴트.
- **Project type:** 웹 앱, 2개 라우트 — `/`(구조화된 프롬프트 빌더, 스텝형) → `/practice/[id]`(3영역: 지시문 / Sandpack 에디터+실행 프리뷰 / AI 피드백 패널).
- **기억 포인트:** "부담 없이 눌러서 시작하는 느낌."

## Aesthetic Direction
- **Direction:** Terminal(macOS 터미널 창) — 개발자 도구의 어휘를 그대로 가져오되, 사용자에게 직접 말을 거는 단 한 줄에만 사람의 목소리를 얹는다.
- **Decoration level:** minimal — 배경 텍스처/그리드 없음 (초기안의 그래프 페이퍼 그리드는 가독성 문제로 제거). 장식은 트래픽라이트 점, ASCII 진행률 바 정도로 최소화.
- **Mood:** 정직하고 담백한 개발 도구. 다크 SaaS 대시보드도, 파스텔 AI 챗봇도 아님. 신뢰는 터미널 어휘(모노스페이스, CLI 메뉴, 주석 스타일 진행률)에서, 따뜻함은 헤딩 한 줄의 세리프 이탤릭에서 나온다.
- **Reference sites:** openlume.com (경쟁 서비스 — 스텝형 온보딩 + 진행률 표시 패턴만 참고, 컬러/레이아웃은 의도적으로 따라가지 않음).
- **Color reference:** [Apple System Colors — Light](https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/schemes/Apple%20System%20Colors%20Light.itermcolors), [Apple System Colors — Dark](https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/schemes/Apple%20System%20Colors.itermcolors) (mbadolato/iTerm2-Color-Schemes).

## Typography
- **Voice (사용자에게 말을 거는 단 한 줄):** Fraunces (italic, 500) — 예: 스텝 질문 헤딩("오늘 배운 개념을 골라주세요"). 이 역할에만 한정해서 쓴다.
- **Body:** Instrument Sans — 설명 문단, 힌트 텍스트.
- **UI 크롬(진행률, back/continue, 윈도우 타이틀):** JetBrains Mono.
- **선택지 / 리스트 항목 (한글 개념명 + 영문 API명이 섞이는 지점):** Nanum Gothic Coding — JetBrains Mono는 한글이 라틴 폭에 맞춰져 있지 않아 한/영 혼용 줄에서 리듬이 깨짐. 선택형 옵션(개념 선택기, 상황 칩 등)에만 적용하고 UI 크롬은 JetBrains Mono를 유지한다.
- **Code(Sandpack 에디터):** JetBrains Mono.
- **Loading:** Google Fonts CDN.
  ```
  https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500;600&family=Nanum+Gothic+Coding:wght@400;700&display=swap
  ```
- **Scale:** voice 22–40px / section label 14px (mono, uppercase) / body 15.5px / UI·mono 12–14px / hint 13.5px.

## Color
- **Approach:** restrained — 액센트 1개(blue) + 시맨틱 3개(red/green/yellow) + 중립. 브랜드 컬러를 별도로 만들지 않고 macOS 시스템 컬러를 그대로 채택.
- **Primary accent (blue):** Light `#3B82F7` / Dark `#0A84FF` (다크 값은 실제 macOS systemBlue와 동일) — CTA, 링크, 선택 상태 텍스트.
- **Selection (선택된 항목 배경):** Light `#B4D7FF` / Dark `#3F638B` — 스킴의 Selection Color를 그대로 사용.
- **Semantic:**
  - success(green): Light `#3FA24A` / Dark `#32D74B`
  - warning(yellow): Light `#B4930A` / Dark `#FFD60A`
  - error(red): Light `#EB5545` / Dark `#FF453A`
- **Neutrals:**
  - background: Light `#FFFFFF` / Dark `#1E1E1E`
  - surface(window chrome, 카드): Light `#F6F6F7` / Dark `#2A2A2C`
  - sunken(코드 블록): Light `#EEEEF0` / Dark `#161616`
  - titlebar: Light `#ECECEE` / Dark `#323234`
  - foreground(ink): Light `#1D1D1F` / Dark `#F2F2F5`
  - muted text: Light `#6E6E73` / Dark `#98989D`
  - faint text: Light `#98989D` / Dark `#6E6E73`
  - line/border: Light `#DBDBDF` (strong `#C6C6CB`) / Dark `#3A3A3C` (strong `#48484A`)
- **Dark mode:** 별도 팔레트로 완전히 정의(위 값). 채도를 임의로 낮추지 않고 스킴의 dark 원본 값을 그대로 사용.

## Spacing
- **Base unit:** 8px.
- **Density:** comfortable — 터미널 창 내부 패딩 28–36px, 카드/리스트 아이템 패딩 10–14px.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48).

## Layout
- **Approach:** grid-disciplined이지만 화면 성격에 따라 창 크롬 사용 여부를 가른다 — "프로그램 화면"(코드 에디터, 로그)은 터미널 창으로, "질문 하나에 답하는" 가벼운 스텝 화면은 창 없이 타이포 스케일로 위계를 만든다.
- **프롬프트 빌더 화면(`/`):** 창(traffic-light) 없음. 위에서 아래로 스텝 레일 → 라벨(`concept`, mono 12px faint) → 헤딩(Fraunces italic 26px, 최상위 시각 요소) → 본문(Instrument Sans, muted) → 입력 영역(sunken 배경 + `>` 프롬프트 글리프로 존재감 강화, 라운드 md) → CTA(우측 정렬, accent blue 채움 버튼). 그룹핑을 박스가 아니라 스케일 대비(라벨<헤딩<본문<입력<CTA)로 만든다. 선택지형 스텝(상태 선택기 등)도 같은 원칙 적용 — 번호 매겨진 CLI 메뉴 형태(`1 useState`, `2 이벤트 버블링` …), 선택된 항목은 번호 자리를 `>`로 치환 + Selection 배경색.
- **실습 세션 화면(`/practice/[id]`):** 전체 화면(edge-to-edge, 여백 없음) 4분할. 최상단에 타이틀바(`bg-titlebar`, 실습 제목 텍스트 + 우측 테마 토글 버튼) 하나를 두되 **traffic-light 점은 넣지 않음** — 기능 없는 요소가 클릭 가능해 보이면 안 된다는 원칙(패널별 창 크롬을 없앤 이유와 동일). 각 패널은 창처럼 보이지 않게 얇은 `border-line` 구분선 + 소문자 라벨(mono, uppercase, faint)만으로 영역을 나눈다(에디터 영역은 라벨도 없음 — "practice.tsx" 같은 파일명 라벨이 오히려 혼란을 줌). 배치: 좌측 지시문(전체 높이) / 우측은 위쪽 에디터(크게, 라벨 없음) + 아래쪽 AI 피드백(고정 높이 행) — "피드백 받기" 버튼은 별도 패널로 빼지 않고 AI 피드백 패널 헤더 행(라벨과 같은 줄, 우측 정렬)에 고정. 버튼을 누르면 그 아래 로그가 채워지는 인과관계가 같은 패널 안에서 바로 보이게 함.
- **진행률(스텝 레일):** 프롬프트 빌더 화면 최상단에 배치. 상단 줄은 `# STEP N OF 4 — <스텝명>`(주석 컨셉 유지) / `N%`를 space-between으로 배치하고, 그 아래 사각 노드(모서리만 둥글게) + 연결선으로 된 스텝 레일. 완료·현재 노드는 accent blue 채움(현재는 링 강조 추가), 대기 노드는 테두리만. 노드·연결선 색은 accent blue 하나로 통일(success green 미사용 — green은 정답/통과 등 실제 성공 시맨틱 전용으로 남겨둠). 입력 영역의 배경(sunken)·보더(line) 색이 레일과 동일 팔레트를 공유해 시각적으로 이어지게 한다.
- **Max content width:** 프롬프트 빌더 640px 전후(단일 컬럼 폼, 중앙 정렬). 실습 세션은 max-width 없이 뷰포트 전체를 채운다(교육 플랫폼 참고 화면처럼 실제 작업 공간처럼 보이는 게 중요).
- **Border radius:** sm 5px / md 9px — 소프트한 라운드보다 각 잡힌 툴 느낌 유지.

## Motion
- **Approach:** minimal-functional. 프롬프트 라인의 커서 깜빡임 정도만 장식적 모션으로 허용, 나머지는 상태 전환(스텝 이동, 스트리밍 텍스트)을 돕는 용도로만 사용.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out).
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms).
- `prefers-reduced-motion` 존중 (커서 깜빡임 등 장식 애니메이션은 비활성화).

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-20 | "코드 스케치북"(종이+세리프) 1차안 제안 | 낙서하듯 가볍게 시작한다는 기억 포인트에 맞춰 제안, openlume과 색/레이아웃 차별화 |
| 2026-08-20 | 종이+세리프 → 터미널 컨셉으로 전면 전환 | "IT 느낌이 떨어진다"는 피드백. 세리프는 사용자에게 말을 거는 단 한 줄에만 남기고 나머지는 터미널 어휘로 전환 |
| 2026-08-20 | 배경 그래프 그리드 제거 | 가독성 저하 피드백 |
| 2026-08-20 | 컬러를 Apple System Colors(iTerm 스킴) light/dark로 확정 | 사용자가 직접 참조 스킴 첨부 — 다크 값이 실제 macOS 시스템 컬러와 일치해 신뢰도 높음 |
| 2026-08-20 | 선택지 폰트를 Nanum Gothic Coding으로, UI 크롬(진행률/버튼)은 JetBrains Mono 유지 | 한글 개념명 + 영문 API명이 섞이는 지점에서 JetBrains Mono의 라틴 중심 폭이 리듬을 깨서, 그 영역만 교체 |
| 2026-08-20 | 선택된 리스트 항목의 볼드 처리 제거 | 색상(Selection 배경 + accent 텍스트)만으로 충분히 구분되어 볼드는 과함 — 최종 확정 |
| 2026-08-21 | 진행률을 ASCII 바에서 스텝 레일(사각 노드+연결선)로 변경, 창 내부 → 페이지 상단으로 이동 | openlume 참고 화면의 스텝 레일이 더 직관적이라는 피드백. 단, 원형/아이콘 대신 사각 노드로 터미널 각진 톤 유지 |
| 2026-08-21 | 스텝 레일 컬러를 accent blue 하나로 통일 (success green 미사용) | green은 "정답/통과" 같은 실제 성공 시맨틱 전용으로 남겨 의미 희석 방지. DESIGN.md의 "액센트 1개+시맨틱 3개" 원칙에도 부합 |
| 2026-08-21 | 프롬프트 빌더를 별도 라우트(`/`)로 분리, 실습 세션은 `/practice/[id]` | 주제 선택 단계에서 다른 영역을 숨기는 것보다 라우트 자체를 분리하는 게 인지 부하를 더 명확히 줄임 |
| 2026-08-21 | 프롬프트 빌더 화면에서 터미널 창(traffic-light) 크롬 제거, 타이포 스케일(라벨<헤딩<본문<입력<CTA)로 위계 구성 | 스텝 레일과 창이 시각적으로 분리된 느낌을 줌 + "정보 위계가 안 보인다"는 피드백. 창은 실제 프로그램 화면(에디터/로그)에만 남기고, 질문 하나짜리 화면은 스케일 대비로 위계를 만듦. 입력 영역은 sunken 배경+`>` 글리프로 존재감 보강 |
| 2026-08-21 | 실습 세션 화면을 여백 없는 전체 화면 4분할로 재구성, 패널별 traffic-light 창 크롬 제거하고 페이지 최상단에 타이틀바 하나만 남김 | 패널마다 창처럼 보이면 "닫기/이동 가능해 보이는데 실제로는 안 됨"이 교육 자료로 쓸 때 혼란을 줌. 여백도 불필요하게 많다는 피드백. 참고한 교육 플랫폼 화면처럼 실제 작업 공간에 가깝게 구성 |
| 2026-08-21 | "코드 확인받기" 버튼을 별도 패널에서 AI 피드백 패널 헤더로 이동, 텍스트도 "피드백 받기"로 변경 | 4개 옵션(에디터 툴바/피드백 헤더/전체폭 액션바/FAB) 중 비교해서 결정 — 별도 패널은 존재감이 애매했고, 버튼-결과의 인과관계가 같은 패널 안에서 보이는 게 가장 직관적. 텍스트도 피드백 패널에 속한 느낌으로 자연스럽게 수정 |
| 2026-08-21 | 남은 타이틀바에서도 traffic-light 점 완전 제거, 에디터 영역 파일명 라벨도 제거 | 기능 없는 요소가 눌리고 싶게 생기면 안 된다는 원칙을 최상단 타이틀바까지 일관 적용. "practice.tsx" 라벨은 실제 파일 탐색기가 없는데 파일명을 보여줘 혼란을 줌 |
| 2026-08-25 | 실습 세션 타이틀바에 테마(라이트/다크) 토글 버튼 추가 — "제목 텍스트만" 원칙에서 예외 | 다크모드 지원에 최소한의 기능 요소가 필요해 예외를 둠. 나중에 인증이 붙으면 드롭다운이나 설정 화면으로 옮길 수 있도록 `ThemeToggle`을 위치에 종속되지 않는 독립 컴포넌트로 구현 |
