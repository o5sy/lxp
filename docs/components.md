# 컴포넌트 문서 (AI 맞춤 실습 생성기)

전역 상태([usePromptBuilderStore](../src/store/prompt-builder-store.ts))를 중심으로 두 화면(`/`, `/practice/[id]`)을 구성하는 실제 컴포넌트를 정리한다. 스타일/토큰 결정은 [DESIGN.md](../DESIGN.md), 기술스택 선택 이유는 [ADR](adr/README.md), 요구사항 배경은 [PRD](designs/ai-adaptive-practice-generator.md)를 참고.

## 화면 구조

```
/ (page.tsx)
└─ PromptBuilderPanel            실습 생성 온보딩 3스텝
   ├─ StepRail                   진행률 표시
   ├─ ConceptStep   (step 1)
   ├─ DifficultyStep (step 2)
   └─ DetailStep     (step 3, 선택)

/practice/[id] (page.tsx)
├─ InstructionPanel              좌측 — AI 생성 지시문
│  └─ InstructionMarkdown        섹션 분할 렌더링 + 완료 기준 체크리스트
└─ SandpackSession               우측 — 코드 에디터 + 실행 + 피드백
   ├─ SandpackProvider (Sandpack 자체 상태 소유)
   ├─ CodeSync                   스토어 starterCode → Sandpack 파일 동기화
   └─ FeedbackPanel              [피드백 받기] 버튼 + 라운드별 결과
```

두 화면 모두 `ResizeHandle` + `useResizablePanel`로 패널 폭/높이를 드래그 조절할 수 있고, `ThemeToggle`로 라이트/다크를 전환한다.

## 상태 관리 원칙

`usePromptBuilderStore`(Zustand) 하나가 화면 전체 상태(빌더 입력값, 생성 상태, 피드백 상태)를 소유한다. 모든 컴포넌트는 **셀렉터 단위로 구독**한다(`useStore((s) => s.concept)` 형태) — 토큰 단위 스트리밍 갱신 시 관련 없는 컴포넌트가 리렌더되지 않도록 하기 위함ADR 참고. Sandpack 내부 코드 상태(`useActiveCode` 등)는 스토어가 아니라 Sandpack 자체 컨텍스트가 소유하며, 스토어와는 `CodeSync`가 `starterCode → Sandpack` 단방향으로만 동기화한다(상태 이중 소유 금지).

`generationStatus`/`feedbackStatus`는 동일한 5단계(`idle → loading → streaming → done`, 또는 `error`)를 공유하는 `AsyncStatus` 타입이다. PRD의 "5개 UI 상태(로딩/스트리밍/에러/빈화면/완료)" 수용 기준은 이 두 상태값과, 각 패널의 조건부 렌더링으로 구현되어 있다.

---

## `features/prompt-builder`

### `PromptBuilderPanel`
경로: [prompt-builder-panel.tsx](../src/features/prompt-builder/components/prompt-builder-panel.tsx)

3스텝 온보딩의 컨테이너. `step`에 따라 `ConceptStep`/`DifficultyStep`/`DetailStep` 중 하나만 렌더링하고, 하단 네비게이션(뒤로/다음/제출)을 담당한다.

- Props: 없음(스토어 직접 구독)
- `canGoNext`: step 1은 `concept`이 비어있지 않을 때, step 2는 `difficulty`가 선택됐을 때만 다음으로 진행 가능(3단계는 선택 입력이라 조건 없음)
- 제출 시 `concept`을 슬러그화해 `/practice/{slug}`로 이동 — 실습 지시문 생성 자체는 이동 후 대상 페이지에서 트리거됨
- 개발 환경(`NODE_ENV === "development"`)에서만 "목데이터로 미리보기" 링크 노출 — 실제 API 호출 없이 화면 흐름만 확인하는 QA용 진입점

### `ConceptStep`
경로: [concept-step.tsx](../src/features/prompt-builder/components/concept-step.tsx)

온보딩 1단계. 개념/기술명 자유 입력 + 자동완성 하이브리드(PRD "핵심 메커니즘" §1) 구현체.

- Props: 없음
- 인라인 고스트 자동완성(입력한 접두어를 자동 완성해 선택 영역으로 보여주는 방식) + 드롭다운 제안 목록을 동시에 지원
- 키보드 전용 조작 지원: `Tab`으로 인라인 제안 확정, `↑/↓`로 드롭다운 탐색, `Enter`로 선택, `Esc`/방향키 이동/블러/마우스 클릭은 모두 "제안 거절"로 취급
- 한글 등 IME 조합 중에는 자동완성 로직이 개입하지 않음(`isComposingRef`) — 조합 중 개입 시 글자가 깨지는 문제를 막기 위함
- `role="combobox"` + `aria-expanded`/`aria-controls`/`aria-activedescendant`로 ARIA 콤보박스 패턴 준수

### `DifficultyStep`
경로: [difficulty-step.tsx](../src/features/prompt-builder/components/difficulty-step.tsx)

온보딩 2단계. 목표 3종(이해/적용/종합, `PRACTICE_DIFFICULTIES`) 중 하나를 고르는 카드형 단일 선택.

- Props: 없음
- Base UI의 `RadioGroup`/`Radio.Root`를 그대로 사용해 키보드 탐색·ARIA를 직접 구현하지 않고 담보(`aria-labelledby`로 그룹 라벨 연결)

### `DetailStep`
경로: [detail-step.tsx](../src/features/prompt-builder/components/detail-step.tsx)

온보딩 3단계(선택). 한 줄 자유 텍스트 입력 하나만 있으며, 비워도 다음(제출) 진행 가능.

- Props: 없음

---

## `features/practice-editor`

### `SandpackSession`
경로: [sandpack-session.tsx](../src/features/practice-editor/components/sandpack-session.tsx)

`/practice/[id]` 우측 영역 전체 — Sandpack 코드 에디터 + 실행 프리뷰 + 피드백 패널을 한 화면에 배치. `next/dynamic(..., { ssr: false })`로 지연 로딩된다(`page.tsx`에서 import).

- Props: 없음
- `SandpackProvider`가 `template="react"`, `recompileMode: "delayed"` (타이핑 후 1.2초 디바운스 뒤 자동 재실행)로 설정됨
- `starterCode`가 없는 동안(`!starterCode`) 에디터는 `readOnly` — AI가 스트리밍으로 시작 코드를 채우는 중 사용자 타이핑과 충돌하는 것을 방지. 채워지면 오버레이가 사라지고 editable로 전환
- 에디터 폭 / 피드백 패널 높이는 각각 `useResizablePanel`로 드래그 리사이즈 가능(라이브러리 없이 자체 구현 — `shared/hooks/use-resizable-panel`)
- 다크/라이트 테마를 `useTheme()`에서 읽어 Sandpack 자체 테마에도 반영

### `CodeSync` (SandpackSession 내부 비공개 컴포넌트)
스토어의 `starterCode`가 갱신될 때마다 Sandpack의 `/App.js` 파일을 덮어쓴다. 렌더링하는 UI는 없다(`return null`) — 스토어 → Sandpack 단방향 동기화 전담.

---

## `features/feedback-panel`

### `InstructionPanel`
경로: [instruction-panel.tsx](../src/features/feedback-panel/components/instruction-panel.tsx)

`/practice/[id]` 좌측 영역. AI가 생성한 실습 지시문을 보여주는 패널의 상태 분기 담당자.

- Props: 없음
- `generationStatus`에 따라 4가지를 분기: 빈화면(아직 시작 안 함) / 로딩 문구 / 에러 메시지 / `InstructionMarkdown`(instruction이 한 글자라도 있으면 스트리밍 중에도 즉시 렌더링 시작)
- 상단에 `concept · difficulty` 요약과 3단계에서 입력한 `freeText`를 항상 고정 표시(PRD "선택 요약 칩"에 해당하는 실제 구현)

### `InstructionMarkdown`
경로: [instruction-markdown.tsx](../src/features/feedback-panel/components/instruction-markdown.tsx)

지시문 마크다운을 `## ` 헤딩 기준으로 섹션(개요/실습 목표/요구 사항/완료 기준)으로 분할해, 상단 섹션 탭 + scrollspy(스크롤 위치에 따라 활성 탭 자동 갱신)로 렌더링.

- Props: `content: string`, `header?: ReactNode`, `isStreaming?: boolean`, `criteriaChecks?: FeedbackCriterionCheck[] | null`
- 스트리밍 중에는(`isStreaming`) scrollspy 갱신을 건너뛴다 — 델타마다 문서 높이가 바뀌어 활성 탭이 튀는 것을 방지
- "완료 기준" 섹션은 내부 `ChecklistSection`이 별도로 렌더링: `criteriaChecks`가 없으면(AI 피드백 이전) 클릭으로 켜고 끄는 자가 점검 리스트, 있으면(AI 피드백 이후) AI 판정 결과를 그대로 표시하고 더 이상 클릭 불가
- LLM이 GFM 태스크 문법(`- [ ]`)으로 응답해도 비활성 네이티브 체크박스는 제거하고 항상 자체 체크 UI로 통일 렌더링

### `FeedbackPanel`
경로: [feedback-panel.tsx](../src/features/feedback-panel/components/feedback-panel.tsx)

`/practice/[id]` 우측 하단. `[피드백 받기]` 버튼과 라운드별(여러 번 반복 가능) 피드백 로그.

- Props: 없음
- `useActiveCode()`(Sandpack)로 현재 에디터 코드를 읽어 `requestFeedback`에 함께 전달 — 피드백은 실행마다 자동 호출되지 않고 이 버튼으로만 트리거(PRD "명시적 버튼" 요구사항)
- 버튼은 `generationStatus === "done"` && `difficulty` 선택됨 && 피드백이 로딩/스트리밍 중이 아닐 때만 활성화
- 각 라운드는 `FeedbackVerdictBadge`(완료 기준 충족 ✅ / 부족 ⚠️)와 `MarkdownContent`로 렌더링되고, 새 라운드가 완료되면 그 라운드 시작 지점으로 자동 스크롤

---

## `shared/ui` (범용 프레젠테이션 컴포넌트)

| 컴포넌트 | Props | 역할 |
|---|---|---|
| [`StepRail`](../src/shared/ui/step-rail.tsx) | `currentStep, totalSteps, stepLabel` | 온보딩 진행률 바 — 완료(✓)/현재/예정 단계를 시각 구분 |
| [`ResizeHandle`](../src/shared/ui/resize-handle.tsx) | `axis, isDragging, onPointerDown/Move/Up` | 패널 리사이즈 드래그 바(라이브러리 없이 pointer 이벤트로 자체 구현). `role="separator"` + `aria-orientation` |
| [`ThemeToggle`](../src/shared/ui/theme-toggle.tsx) | `className?` | 라이트/다크 전환 버튼. `aria-label`로 전환 방향을 명시 |
| [`MarkdownContent`](../src/shared/ui/markdown-content.tsx) | `content, className?` | 범용 마크다운 렌더러(피드백 로그 등에서 사용). 섹션 구분 없이 통짜로 렌더링한다는 점에서 `InstructionMarkdown`과 구분됨 |
| [`TerminalWindow`](../src/shared/ui/terminal-window.tsx) | `title, children, className?, bodyClassName?` | 터미널 창 모양 래퍼(DESIGN.md 톤앤매너) |
| [`Button`](../src/shared/ui/button.tsx) | shadcn 표준(`variant, size, ...`) | Base UI `Button` 기반 shadcn 버튼. `cva`로 6개 variant/8개 size 정의 |

`resize-handle`, `theme-toggle`, `step-rail`은 접근성이 필요한 상호작용(드래그 리사이즈, 테마 전환, 진행 표시)을 외부 라이브러리 없이 직접 구현한 사례 — [의존성 추가 규칙](../CLAUDE.md#의존성-추가-규칙)에 따라 "수십~백여 줄 안에서 구현 가능한 것"으로 판단해 자체 구현했다.

---

## 문서화 범위 밖

- `src/lib/llm/*` (Gemini 연동), `src/features/*/lib/*` (프롬프트 조립·SSE 파싱), `src/app/api/*` (서버 라우트)는 UI 컴포넌트가 아니므로 이 문서 범위에서 제외. LLM 프로바이더 선택 이유는 [ADR](adr/README.md), 서버 프록시 정책은 [misc.md](adr/misc.md) 참고.
- 대안 비교(Sandpack vs 자체 샌드박스 등)는 [07-code-execution-sandpack.md](adr/07-code-execution-sandpack.md)에 이미 문서화되어 있어 중복 기술하지 않는다.
