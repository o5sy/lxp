# 코드 실행: Sandpack

**Status:** Accepted (PRD에서 선확정)
**Date:** 2026-08-20

## Context

PRD([Approaches Considered](../designs/ai-adaptive-practice-generator.md#approaches-considered))에서 이미 검토·확정된 결정을 정리한다. 실행 없는 정적 평가(Approach A)는 사용자가 관찰한 진짜 이탈 원인(전환 비용)을 해결하지 못하고, 자체 Web Worker 샌드박스(Approach B)는 5일 안에 보안·안정성까지 챙기기엔 리스크가 크다.

## Decision

**`@codesandbox/sandpack-react`(Sandpack)를 채택한다.** 에디터는 Sandpack 기본값(CodeMirror 기반)을 그대로 쓰고, 에디터 교체를 대비한 어댑터 레이어(`<PracticeEditor>`)는 만들지 않는다 — 5일 스코프엔 실제 Monaco 교체 작업이 없어 과잉설계로 판단(YAGNI). 향후 필요해지면 그때 리팩터링한다.

## Consequences

- 검증된 실행 엔진 위에 진짜 차별점(PCM-L 기반 개인화 지시 생성 + 스트리밍 피드백)에 시간을 집중할 수 있다.
- 외부 라이브러리 종속, iframe 기반이라 Lighthouse 성능 점수에 영향 — `next/dynamic(ssr:false)`로 지연 로딩해 완화한다.
- 나중에 Monaco로 교체하려면 이번에 만든 직접 결합 코드를 리팩터링해야 하지만, 그 비용은 지금 추상화를 만드는 비용보다 낮다고 판단.
