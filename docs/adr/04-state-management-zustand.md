# 전역 상태: Zustand

**Status:** Accepted
**Date:** 2026-08-20

## Context

원페이저 원칙("최소 전역 상태 하나로 관리, Sandpack 내부 상태는 이중 소유하지 않음")에 따라 전역 상태 라이브러리가 필요하다. 이 프로젝트의 핵심 상호작용은 LLM 스트리밍이며, 스트리밍 중에는 상태(생성 중인 코드/텍스트)가 초당 여러 번 갱신된다.

비교한 대안:

| | Context API | Jotai | Zustand |
|---|---|---|---|
| 의존성 | 없음(React 내장) | 라이브러리 | ~1KB 라이브러리 |
| 리렌더 범위 | value 변경 시 구독 컴포넌트 전체 리렌더(세밀한 구독 없음, 직접 쪼개거나 memo 필요) | atom 단위로 자동 세밀 구독 | 셀렉터로 필요한 필드만 구독 |
| 모델 | — | 원자(atom) 단위 조합, bottom-up, 파생 상태에 보일러플레이트 필요 | 스토어 객체 하나에 상태+액션 정의(Redux 슬라이스에 가까움) |
| 스트리밍처럼 잦은 업데이트 | Provider 하위 전체가 매번 리렌더될 위험 | 세밀하지만 이번 규모(상태 4~5개)엔 원자 분할 오버헤드 | 셀렉터 하나로 리렌더 범위 최소화, 보일러플레이트 적음 |

## Decision

**Zustand를 채택한다.**

```ts
const useAppStore = create((set) => ({
  slots: { concept: '', stage: null, situations: [], freeText: '' },
  status: 'idle', // idle | streaming | error | done
  code: '',
  feedback: '',
  setSlot: (key, value) => set((s) => ({ slots: { ...s.slots, [key]: value } })),
  appendCodeChunk: (chunk) => set((s) => ({ code: s.code + chunk })),
  setStatus: (status) => set({ status }),
}))
```

## Consequences

- 코드가 토큰 단위로 스트리밍될 때, `code` 필드를 구독하지 않는 컴포넌트(프롬프트 빌더 등)는 리렌더되지 않는다 — Context로는 이를 막으려면 Context를 여러 개로 쪼개거나 곳곳에 memo를 발라야 한다.
- Jotai 대비 원자 단위 분할·파생상태 보일러플레이트가 없어, 상태 종류가 4~5개뿐인 이번 규모에 적합하다.
- "전역 상태는 하나"라는 원페이저 원칙을 스토어 파일 하나로 그대로 지킨다.
- 학습비용: `create()`와 셀렉터 패턴만 알면 되며, persist/devtools 미들웨어는 이번 스코프에서 사용하지 않는다.
