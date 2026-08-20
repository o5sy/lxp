# 폴더 구조: 기능별 슬라이스 (Lite FSD)

**Status:** Accepted
**Date:** 2026-08-20

## Context

FSD(Feature-Sliced Design)를 적용하고 싶으나, 5일 안에 결과물을 내야 하는 상황에서 FSD를 학습하며 적용하는 것은 리스크가 크다. FSD는 `app/processes/pages/widgets/features/entities/shared` 6개 레이어와 레이어 간 단방향 의존성 규칙, 레이어별 public API(`index.ts`) 컨벤션을 포함하는 완결된 방법론이며, 여러 페이지·여러 팀이 오래 유지보수하는 앱에서 가치가 크다. 이번 프로젝트는 화면 1개, feature 3개(프롬프트 빌더/에디터/피드백 패널)뿐이라 풀 FSD의 이점(레이어 강제 분리)이 거의 발생하지 않는 문제를 미리 막는 데 시간을 쓰게 된다.

비교한 대안:
1. **FSD 풀버전** — 검증된 구조, 의존성 강제. 단, 학습곡선과 레이어 판단 오버헤드가 이 규모엔 과함.
2. **타입별 분류**(`components/`, `hooks/`, `lib/`, `store/`) — 시작이 가장 빠르지만 기능이 늘면 관련 파일을 찾기 위해 여러 폴더를 오가야 함.
3. **기능별 폴더(FSD 정신만 차용)** — "관련 파일이 한곳에 모임"이라는 FSD 핵심 이점을 레이어 규칙 없이 확보.

## Decision

**기능별 폴더 구조(Lite FSD)를 채택한다.** 레이어 강제 규칙과 public API 컨벤션은 도입하지 않되, 나중에 FSD로 승격하기 쉬운 형태로 지금부터 파일을 배치한다.

```
src/
  features/
    prompt-builder/
      components/  ConceptCombobox.tsx, StageSelector.tsx, ...
      store.ts       # 필요시 이 기능만의 슬라이스
    practice-editor/
      PracticeSandpack.tsx
    feedback-panel/
      FeedbackPanel.tsx
  shared/
    ui/            # shadcn 프리미티브
    lib/           # promptTemplate.ts, llm 어댑터
  store/
    appStore.ts    # 전역 상태 (04 참조)
```

## Consequences

- FSD를 지금 배우지 않아도 "이 기능 관련 파일 = 이 폴더 하나"라는 이득의 대부분을 확보한다.
- 레이어 간 의존성을 강제하는 장치가 없어 `feedback-panel`이 `prompt-builder` 내부를 직접 import해도 막아주지 않는다 — 3개 기능·1인 개발 규모에서는 리스크가 낮다고 판단.
- 향후 기능이 늘어나 팀 단위로 쪼갤 필요가 생기면, 이미 기능별로 모여 있으므로 FSD 레이어(entities/widgets 등)를 얹는 리팩터링이 어렵지 않다.
