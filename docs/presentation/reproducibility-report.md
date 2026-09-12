# 재현성 rubric 근거자료 (AI 개발 멘토)

작성일: 2026-09-12
근거: [`scripts/rubric.ts`](../../scripts/rubric.ts), [`scripts/capture-practice-samples.ts`](../../scripts/capture-practice-samples.ts), [`scripts/check-rubric.ts`](../../scripts/check-rubric.ts), [`fixtures/practice-samples/`](../../fixtures/practice-samples/)

## 1. 이전 (1차 발표, 2026-08-26) 한계

[`presentation-draft.md` S4. 검증 결과](presentation-draft.md#s4-검증-결과-목표-50초1분)에 이렇게 명시되어 있었다 (원문 인용):

> **재현성 — 코드로 확인:**
> 응답 스키마(Zod)로 구조적 일관성은 강제됨
> *→ 반복 실행을 검증하는 자동화 테스트는 아직 없음, 개선 과제*

> **생성 품질:**
> 체크리스트(정답 미제공 / 완료 기준 명확 / 실제 실행 가능)는 설계했으나, 실제 채점은 이번 기간에 진행하지 못함, 개선 과제

즉 1차 발표 시점에는 "스키마가 응답 구조를 강제한다"는 설계상 사실만 있었고, 그 구조가 여러 번 생성해도 실제로 지켜지는지 반복 검증한 적은 없었다. 생성 품질 체크리스트도 항목만 설계되어 있었고 실제 샘플에 대입해 채점해본 적이 없었다.

## 2. 지금 (2차, 이번 세션) — 만든 것

### 2.1 rubric — 체크리스트를 코드로 만듦

`scripts/rubric.ts`에 `SYSTEM_PROMPT`(`src/features/prompt-builder/lib/build-prompt.ts`)의 규칙을 그대로 옮긴 9개 체크를 만들었다:

- 지시문: 개요가 헤딩 없이 시작하는지, `## 실습 목표` → `## 요구 사항` → `## 완료 기준` 순서로 모두 존재하는지, 각 섹션이 비어있지 않은지, 개요 문단 수가 2~3개인지
- 완료 기준이 Sandpack 화면 밖에서만 확인 가능한 방법(`console.log`, `document.title`, "콘솔", "개발자 도구", "탭 제목")을 쓰지 않는지, "실행 버튼" 문구를 쓰지 않는지
- 시작 코드: `export default function App`을 갖는지, TypeScript 컴파일러 API(`typescript` 패키지 — 신규 의존성 없이 재사용)로 JSX 파싱 오류가 없는지, 미완성 표시(TODO 등)가 남아있는지

이 9개 체크 각각이 곧 "생성 품질"의 정의다 — 1차 발표에서 "설계했으나 채점 못함"이라던 체크리스트가, 이번엔 실제로 실행 가능한 코드가 됐다.

### 2.2 캡처 — concept×difficulty 3건을 실제 API로 1회 캡처

`scripts/capture-practice-samples.ts`가 실제 앱 코드(`buildPracticePrompt` + `practiceGenerationSchema` + `getModel()`)를 그대로 재사용해 Gemini API를 호출하고, 결과를 `fixtures/practice-samples/*.json`으로 저장했다. 1차 캡처는 `typing` 난이도 × `useState`/`클로저`/`CSS flexbox` 3건이다. 이미 캡처된 조합은 건너뛰도록(idempotent) 만들어서, 나중에 조합을 추가해도 기존 3건을 다시 호출하지 않는다.

### 2.3 검증 — API 재호출 없이 반복 확인되는 것을 실제로 확인함

`npm run check:rubric`을 여러 번 실행해도 네트워크 호출 없이 동일한 결과가 나오는 것을 이번 세션에서 직접 확인했다:

```
=== css-flexbox__typing.json (CSS flexbox / typing) ===
  모든 규칙 통과
=== usestate__typing.json (useState / typing) ===
  모든 규칙 통과
=== 클로저__typing.json (클로저 / typing) ===
  모든 규칙 통과

=== 요약 (샘플 3건) ===
모든 샘플이 모든 규칙을 통과했습니다.
```

1차 발표의 "반복 실행을 검증하는 자동화 테스트는 아직 없음"이 이번에 "있음, 그리고 무료 API 호출 없이 반복 가능함"으로 바뀐 지점이다.

## 3. 실제로 있었던 보정 사례 — 캡처 없이는 몰랐을 것

rubric 초안의 "미완성 표시(TODO 등)가 남아있는지" 체크는 처음에 `/TODO|작성하세요|구현하세요/` 정규식이었다. 3건을 캡처해 실제로 돌려보니, `css-flexbox__typing.json` 샘플에서 이 체크가 실패했다 — 모델이 "TODO"가 아니라 아래처럼 요구사항 번호를 참조하는 코멘트로 힌트를 남겼기 때문이다:

```js
// 요구사항 1: display: 'flex', justifyContent: 'center' 추가
const containerStyle1 = { ... };
```

이건 실제로 정답이 채워진 게 아니라(다른 두 샘플의 `TODO` 코멘트와 성격이 같은 정당한 미완성 상태), 정규식이 그 표현 방식을 못 잡아낸 것이었다. 정규식에 `요구사항\s*\d+`를 추가해 넓힌 뒤 재검증하니 3건 모두 통과했다.

이 사례가 이번 작업의 핵심 가치를 보여준다: rubric을 "이렇게 만들어질 것이다"라는 추측만으로 설계했다면 이 경우를 놓쳤을 것이고, **실제 캡처 샘플에 대고 돌려봤기 때문에** 발견하고 보정할 수 있었다.

## 4. 한계 (발표 시 명시 권장)

- **난이도 커버리지**: 1차 캡처는 `typing` 난이도 3건뿐이다. `apply`/`stretch` 난이도나 다른 개념에서도 rubric이 똑같이 유효한지는 아직 확인하지 못했다 — 다음 캡처 확장 대상이다.
- **범위 판정 제외**: "이 개념이 코드 실습으로 만들 수 있는 개념인가"(개념 적합성 판정)는 이 작업 범위 밖이다 — `feat/generation-safety` 워크트리의 화이트리스트/status-reason 판정이 별도로 담당한다. 이 rubric은 "이미 생성된 결과물의 구조적 품질"만 검사한다.
- **LLM judge 없음**: rubric은 의도적으로 결정론적 코드 체크만으로 구성했다(정규식/구조 검사). 별도 LLM 채점 모델은 쓰지 않는다 — 그래야 API 호출 없이 무료로 반복 검증할 수 있기 때문이다. 대신 "톤이 멘토링답게 느껴지는가" 같은 정성적 품질은 이 rubric으로 잡지 못한다.
- **샘플 수**: 3건은 rubric 초안을 실사례로 보정하기 위한 최소 표본이며, 통계적으로 일반화하기엔 적은 수다.

## 5. 발표 슬라이드용 한 줄 요약

- 1차 발표에서 "개선 과제"로 명시했던 재현성 자동화 검증과 생성 품질 채점을, concept×difficulty 3건 실캡처 + rubric 9개 체크로 실제로 구현
- `npm run check:rubric`은 API 호출 없이 몇 번이든 재실행 가능 — 무료 쿼터 제약 아래서도 반복 검증이 가능함을 실측으로 확인
- rubric 보정 과정에서 실제로 "TODO 대신 요구사항 번호를 참조하는 힌트 코멘트" 패턴을 발견해 규칙을 수정 — 추측이 아니라 실제 캡처 샘플로 rubric을 검증했다는 근거
- 현재는 `typing` 난이도 3건까지만 커버, `apply`/`stretch` 확장과 개념 적합성 판정(별도 트랙)은 다음 단계로 남김
