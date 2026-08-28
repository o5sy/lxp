# 프론트엔드 컴포넌트 아키텍처 — AI 개발 멘토

**작성일:** 2026-08-26 · **작성자:** 오승연

*이 문서는 [아키텍처 개요](overview.md) §5.2(Level 2 — 프론트엔드)를 상세화한다.*

## 1. 범위

- 이 문서는 **브라우저에서 실행되는 프론트엔드**를 하나의 컨테이너로 보고, 그 안의 컴포넌트(화면 단위 컨테이너 / 전역 상태 / 서드파티 런타임)가 어떻게 나뉘어 있고 서로 어떻게 연결되는지를 정리한다.
- 서버 API 라우트는 프론트가 의존하는 **인터페이스 계약**으로만 등장하고, 내부 구현(프롬프트 조립, LLM 연동)은 다루지 않는다 — 그 이유는 [ADR](../adr/README.md), 요구사항 배경은 [PRD](../designs/ai-adaptive-practice-generator.md), 스타일/토큰 결정은 [DESIGN.md](../../DESIGN.md)를 참고.

## 2. 전체 그림

![C4 Container 다이어그램 — 학습자, 프론트엔드 클라이언트, 백엔드 API 서버, Gemini API](diagrams/c4-container.png)
*(원본 편집 파일: [c4-container.drawio](diagrams/c4-container.drawio) — draw.io에서 열기)*

- 학습자는 브라우저로 **프론트엔드 클라이언트**에 접속해 실습을 만들고 코드를 작성한다.
- 프론트엔드는 실습 생성·피드백이 필요할 때 **백엔드 API 서버**를 REST/JSON으로 호출하고, 응답은 SSE로 스트리밍 받는다.
- 백엔드는 요청을 프롬프트로 조립해 **Gemini API**(외부 시스템, Google 소유)에 전달하고 그 응답을 다시 스트리밍한다.
- 아래부터는 이 중 "프론트엔드 클라이언트" 박스 하나를 열어서 그 안을 다룬다.

## 3. 프론트엔드 컴포넌트 다이어그램

![C4 Component 다이어그램 — 프론트엔드 클라이언트 내부](diagrams/c4-component-frontend.png)
*(원본 편집 파일: [c4-component-frontend.drawio](diagrams/c4-component-frontend.drawio) — draw.io에서 열기)*

## 4. 컴포넌트별 책임과 결정 근거

### 4.1 Prompt Builder 화면 (`/`)

경로: [prompt-builder-panel.tsx](../../src/features/prompt-builder/components/prompt-builder-panel.tsx)

- **책임:** 실습 생성에 필요한 입력값(개념, 목표 난이도, 추가 설명)을 3단계로 수집해 전역 스토어에 기록한다.
- **경계:** 이 화면은 API를 직접 호출하지 않는다. 제출 시 스토어에 값만 남긴 채 `/practice/{slug}`로 이동하고, 실제 생성 요청은 이동한 뒤 Practice Session 화면에서 트리거된다(다이어그램의 점선 화살표 — 데이터 호출이 아니라 라우팅이라 구분).
- **결정 근거:** "질문에 답하기"와 "결과 실행해보기"를 한 화면에 같이 두지 않고 라우트 자체를 분리했다 — 화면을 감추는 것보다 인지 부하를 더 명확히 줄이는 방식이라는 판단(DESIGN.md 결정 로그).

### 4.2 전역 상태 스토어 (Zustand)

경로: [prompt-builder-store.ts](../../src/store/prompt-builder-store.ts)

- **책임:** 두 화면에 걸친 상태를 단일 소스로 소유한다 — 빌더 입력값, 생성 상태(`generationStatus`), 피드백 상태(`feedbackStatus` + 라운드별 배열).
- **경계:** 모든 컴포넌트는 전체 상태가 아니라 **셀렉터 단위로만** 구독한다(`useStore((s) => s.concept)` 형태). Prompt Builder는 값을 "기록"만 하고, Practice Session은 구독(읽기)과 상태 갱신(쓰기) 양쪽을 다 한다 — 실습 생성/피드백 요청을 실제로 트리거하는 쪽이 Practice Session이기 때문.
- **결정 근거:** 생성·피드백 모두 토큰 단위 스트리밍(`instruction-delta` 등)으로 초당 여러 번 상태가 갱신된다. Context API는 구독 범위를 세밀하게 못 자르기 때문에 무관한 컴포넌트까지 리렌더된다 — 이를 피하기 위해 셀렉터 기반 구독이 되는 Zustand를 선택했다.

### 4.3 Practice Session 화면 (`/practice/[id]`)

경로: [page.tsx](../../src/app/practice/[id]/page.tsx), [instruction-panel.tsx](../../src/features/feedback-panel/components/instruction-panel.tsx), [feedback-panel.tsx](../../src/features/feedback-panel/components/feedback-panel.tsx)

- **책임:** 생성/피드백 요청을 실제로 트리거하고, 서버가 보내는 SSE 스트림을 이벤트 단위로 소비해 스토어에 반영한다. 좌측 지시문 패널과 우측 에디터+피드백 패널을 한 화면에서 조율한다.
- **경계:** `parseSSE()`로 응답 스트림을 이벤트 단위(`instruction-delta`, `code`, `feedback-delta`, `verdict`, `done`, `error`)로 파싱하는 지점까지가 이 화면의 책임이다. 그 이벤트가 서버 안에서 어떻게 만들어지는지(프롬프트 조립, LLM 호출)는 이 문서 범위 밖 — 아래 "API 경계" 표가 프론트가 아는 전부다.
- **결정 근거:** 생성·피드백은 독립적으로 반복 가능한 두 개의 비동기 루프라, 상태 모델을 `generationStatus`/`feedbackStatus`로 대칭 설계해 같은 5단계(`idle → loading → streaming → done`, 또는 `error`)를 공유하게 했다.

### 4.4 Sandpack 런타임 (경계가 있는 서드파티 상태)

경로: [sandpack-session.tsx](../../src/features/practice-editor/components/sandpack-session.tsx)

- **책임:** 코드 편집·실행을 전담한다. `SandpackProvider`가 코드 상태를 자체 컨텍스트로 소유한다.
- **경계:** 전역 스토어와는 `starterCode → Sandpack` **단방향으로만** 동기화된다(`CodeSync`가 전담, 렌더링 없음). 반대 방향(Sandpack 안에서 수정된 코드 → 스토어)은 동기화하지 않고, 피드백 요청 시점에만 `useActiveCode()`로 필요한 순간에 읽어온다.
- **결정 근거:** 같은 상태를 스토어와 Sandpack 양쪽이 동시에 소유하면 동기화 버그가 생기기 쉽다 — "누가 최종 소유자인가"를 하나로 고정해 이중 소유를 피했다.

## 5. API 경계 (프론트가 의존하는 계약)

| 엔드포인트 | 요청 바디 | 응답 (SSE 이벤트 순서) |
|---|---|---|
| `POST /api/practice` | `{ concept, difficulty, freeText }` | `instruction-delta`(반복) → `code` → `done` / 실패 시 `error` |
| `POST /api/feedback` | `{ concept, difficulty, instruction, code }` | `feedback-delta`(반복) → `verdict`(`{ criteriaChecks }`) → `done` / 실패 시 `error` |

이 계약 안쪽(프롬프트 조립, LLM 연동, 재시도 정책)은 서버 구현이라 이 문서에서 다루지 않는다 — [ADR](../adr/README.md), [misc.md](../adr/misc.md) 참고.

## 6. 문서화 범위 밖

- 서버 API 라우트 내부 구현, LLM 연동 방식 → [ADR](../adr/README.md), [misc.md](../adr/misc.md)
- 개별 React 컴포넌트의 props·코드 레벨 세부사항 → 위 각 컴포넌트 경로의 소스 직접 참고
- 스타일/디자인 토큰, 레이아웃 결정 로그 → [DESIGN.md](../../DESIGN.md)
- 기술스택 선택 이유(Next.js / Sandpack / Gemini+Vercel AI SDK 등) → [ADR](../adr/README.md)
