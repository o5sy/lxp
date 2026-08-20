# UI 컴포넌트: shadcn/ui (Base UI 기반)

**Status:** Accepted
**Date:** 2026-08-20

## Context

접근성(Lighthouse 접근성 90점 이상, 원페이저 KPI)을 5일 안에 직접 구현하지 않고 어느 정도 담보하고 싶다. 동시에 DESIGN.md는 macOS 터미널 컨셉의 독자적인 비주얼 언어(번호 매겨진 CLI 메뉴, `>` 선택 치환, ASCII 진행률 바, 트래픽라이트 점, 각진 radius 5–9px, 커스텀 폰트/컬러 토큰)를 이미 확정해두었다.

**프리미티브 선택 (Radix vs Base UI):** shadcn CLI의 최신 기본값은 Radix가 아니라 **Base UI**(`@base-ui/react`, `-b base` 프리셋 `base-nova`)다. Base UI는 Radix Primitives를 만든 WorkOS 팀과, MUI가 별도로 유지하던 언스타일드 컴포넌트 라이브러리(구 MUI Base)가 통합되어 나온 후속 프로젝트다 — 접근성 준수 프리미티브를 여러 팀이 각자 유지보수하는 비효율을 줄이기 위한 합병이며, 통합 이후 Radix Primitives는 신규 기능 개발 없이 메인테넌스 모드로 전환됐다. 즉 접근성 구현 근거(WAI-ARIA APG 패턴 준수)는 Radix와 동일한 팀·원칙으로 이어지지만, Base UI 자체의 실전 검증 기간은 Radix(3년+)보다 짧다.

**접근성 기대의 근거:** Base UI는 WAI-ARIA Authoring Practices Guide(APG) 패턴을 따르도록 구현되어 있고, 포커스 관리(다이얼로그 트랩/복귀 등)가 라이브러리 차원에서 자동 처리된다. 단, 이는 **동작/ARIA/키보드 레이어의 보장**이지 WCAG 전체 준수의 보장이 아니다 — 색상 대비·커스텀 스타일링으로 인한 접근성 저하는 별도로 검증해야 한다.

**shadcn vs raw Base UI 직접 사용:** shadcn의 통상적 이점(사전 스타일링된 기본값)은 이번 프로젝트에서 거의 실현되지 않는다 — DESIGN.md 요구사항이 기본 스타일(둥근 카드, 기본 폰트, 기본 색 토큰)을 대부분 갈아엎게 만들기 때문이다. 남는 이점은 (a) Base UI의 접근성/키보드 동작(raw Base UI로도 동일하게 얻음), (b) CSS 변수 기반 테마 배선(= DESIGN.md 토큰을 그대로 꽂을 수 있는 인프라), (c) CVA(variant) 패턴 스캐폴딩.

**shadcn 고유 리스크:** npm 패키지가 아니라 코드를 프로젝트에 복사하는 방식이라 Base UI 보안 패치가 `npm update`로 자동으로 들어오지 않는다 — 복사된 코드는 직접 추적/갱신해야 한다. 공식 레지스트리만 사용하면 설치 스크립트 자체의 공급망 리스크는 낮다.

## Decision

**shadcn/ui(Base UI 기반, `base-nova` 프리셋)를 채택하되, 기본 비주얼 스타일은 전부 DESIGN.md 값으로 재정의한다.** ASCII 진행률 바, 트래픽라이트 점처럼 대응하는 shadcn 컴포넌트가 없는 요소는 shadcn CLI로 받지 않고 직접 마크업한다.

- Combobox → 개념 자동완성 (슬롯1)
- RadioGroup → 상태 선택기, 번호 매겨진 CLI 메뉴로 재스킨 (슬롯2)
- ToggleGroup → 상황 칩 멀티셀렉트 (슬롯3)

alias는 ADR 03(기능별 슬라이스)에 맞춰 `components.json`에서 기본값(`@/components`, `@/lib`)이 아닌 `@/shared/ui`, `@/shared/lib`, `@/shared/hooks`로 재설정한다.

## Consequences

- 키보드 내비게이션·포커스 관리·ARIA 속성을 직접 구현하지 않아도 되어 5일 예산을 아낀다.
- "비주얼 디자인을 덜 만들어도 된다"는 기대는 이번 프로젝트에 적용되지 않는다 — CSS 변수 배선과 variant 패턴 뼈대만 재사용하고, 색·폰트·radius·구조는 전부 새로 입힌다.
- 완성 후 axe DevTools/스크린리더로 별도 접근성 검증이 필요하다(자동 보장 아님).
- Base UI 패키지 보안 패치를 직접 추적해야 하는 유지보수 책임이 생긴다 — 5일 프로젝트에선 영향 적음, 장기 유지 시 재검토 필요.
- Base UI가 Radix보다 실전 검증 기간이 짧아, 드물게 쓰이는 컴포넌트/엣지케이스에서 문서화되지 않은 버그를 만날 가능성이 Radix 대비 상대적으로 높다 — 발견 시 GitHub 이슈로 우회하거나 해당 컴포넌트만 직접 마크업으로 대체.
