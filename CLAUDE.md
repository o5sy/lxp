# gstack

이 프로젝트는 [gstack](https://github.com/garrytan/gstack) 스킬 세트를 사용합니다 (`~/.claude/skills/gstack`, team 모드로 설치되어 세션 시작 시 자동 업데이트됨).

## 브라우저 작업 규칙

- 브라우저로 뭔가 확인/테스트해야 할 때, `mcp__claude-in-chrome__*` 도구를 바로 쓰지 말고 **먼저 사용자에게 물어볼 것**: 실제 로그인된 Chrome(`claude-in-chrome`)으로 할지, gstack의 헤드리스 `/browse`로 할지.
- 로그인 세션이 필요 없는 일반적인 QA/스크린샷/폼 테스트라면 `/browse`가 기본값이지만, 그래도 매번 확인 후 진행한다.

## Git 작업 규칙

- 커밋은 자율적으로 진행해도 된다.
- **푸시(`git push`)는 매번 하기 전에 커밋 로그(`git log`)를 사용자에게 보여주고 확인받은 뒤에 실행한다.**
- **커밋(CL) 단위 기준** (참고: [작은 CL 만들기](https://madplay.github.io/post/small-cls)):
  - **가장 중요한 기준: 하나의 독립된 변경만 담는다.** 서로 관련 없는 변경을 한 커밋에 섞지 않는다. 여러 이유가 섞인 작업을 한 번에 진행했다면, 커밋하기 전에 이유별로 diff를 쪼개서 나눠 커밋한다.
  - 대략 100줄 안팎을 참고 기준으로 삼되, 엄격한 상한선은 아니다 — "독립된 변경 하나"를 지키다 보면 자연히 작아지는 경우가 많고, 억지로 줄 수에 맞추려 어색하게 쪼개지 않는다.
  - 커밋 메시지에 감독(리뷰)에 필요한 맥락을 남긴다 — 무엇을, 왜 바꿨는지.
  - 버그 수정과 리팩토링은 별도 커밋으로 분리한다.
  - 테스트 코드가 있다면 검증 대상 변경과 같은 커밋에 포함한다.
  - "반영 직후에도 시스템이 정상 동작해야 한다"는 기준은 개별 커밋이 아니라 **main에 머지되는 PR(스쿼시 커밋) 단위**에 적용한다 — 로컬 커밋은 배관만 먼저 깔고 나중 커밋에서 화면에 연결해도 된다.

## 워크트리 병렬 작업 규칙

- 사용자가 여러 작업을 워크트리로 나눠서 병렬로 진행하자고 하면, 방식을 먼저 물어본다: (a) 백그라운드 서브에이전트(Agent 도구, `isolation: "worktree"`)로 나눠서 내가 직접 돌릴지, (b) 사용자가 직접 둘러보며 대화로 개선 요청을 남길 수 있는 **새 세션**으로 시작할지.
- (b)를 선택하면: 필요한 워크트리를 직접 만들어주고(`git worktree add -b <브랜치> <경로> <base>`), 각 워크트리마다 **그 세션 혼자서도 맥락 없이 바로 작업을 시작할 수 있는 브리핑 프롬프트**를 만들어 제공한다 — 배경(무슨 프로젝트/문서를 참고해야 하는지), 구체적 작업 내용, 완료 기준을 포함해서 사용자가 그대로 복사해 새 세션에 붙여넣을 수 있게 한다.

## 의존성 추가 규칙

- 간단한 기능은 외부 라이브러리 없이 직접 구현하는 것을 지향한다 (예: 드래그 리사이징, 다크모드 토글처럼 수십~백여 줄 안에서 구현 가능한 것들).
- 정말 라이브러리가 필요하다고 판단되면(구현 난이도가 높거나, 보안/접근성처럼 직접 구현 시 위험이 큰 영역), 추가하기 전에 먼저 사용자에게 물어보고 승인을 받는다.

## 사용 가능한 스킬 (slash command)

`_gstack-command`, `autoplan`, `benchmark`, `benchmark-models`, `browse`, `canary`, `careful`, `codex`, `connect-chrome`, `context-restore`, `context-save`, `cso`, `design-consultation`, `design-html`, `design-review`, `design-shotgun`, `devex-review`, `diagram`, `document-generate`, `document-release`, `freeze`, `gstack-upgrade`, `guard`, `health`, `investigate`, `ios-clean`, `ios-design-review`, `ios-fix`, `ios-qa`, `ios-sync`, `land-and-deploy`, `landing-report`, `learn`, `make-pdf`, `office-hours`, `open-gstack-browser`, `pair-agent`, `plan-ceo-review`, `plan-design-review`, `plan-devex-review`, `plan-eng-review`, `plan-tune`, `qa`, `qa-only`, `retro`, `review`, `scrape`, `setup-browser-cookies`, `setup-deploy`, `setup-gbrain`, `ship`, `skillify`, `spec`, `sync-gbrain`, `unfreeze`

업데이트: `/gstack-upgrade`

## 다른 컴퓨터에서 이어서 쓰기

집 컴퓨터 등 다른 환경에서도 이 저장소를 클론한 뒤 아래만 실행하면 동일하게 쓸 수 있습니다.

```bash
git clone <이 저장소 주소>
cd <클론한 폴더>
~/.claude/skills/gstack/setup --team
```

(gstack 저장소 자체가 로컬에 없다면 먼저 `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack` 로 gstack을 받아야 합니다.)

## 커밋 컨벤션

[Conventional Commits v1.0.0](https://www.conventionalcommits.org/ko/v1.0.0/)을 따릅니다.

```
<타입>[적용 범위(선택)]: <설명>

[본문(선택)]

[꼬리말(선택)]
```

- 타입: `feat`(새 기능, MINOR), `fix`(버그 수정, PATCH). 그 외 `docs`, `style`, `refactor`, `perf`, `test` 등도 허용하되 강제 사항은 아님. **타입은 영어 그대로 유지.**
- 설명(description)은 **국문으로 작성**하고, "추가", "수정", "삭제", "제거", "정리" 등 **명사형으로 종결**한다 (예: `feat: 로그인 화면 추가`, `fix: 세션 만료 오류 수정`, `docs: 커밋 컨벤션 설명 추가`).
- 적용 범위(scope)는 괄호로 명시: 예) `fix(parser): 괄호 파싱 오류 수정`
- 이 저장소처럼 단일 프로젝트만 다루는 레포에서는, scope에 프로젝트명 자체를 반복하지 않는다 (예: `docs(AI 개발 멘토): ...`처럼 레포 전체가 그 프로젝트인데 스코프로 또 적는 건 정보량이 없다). scope는 그 안의 더 세부적인 영역(예: `docs(design)`, `feat(auth)`)을 가리킬 때만 쓰고, 애매하면 생략한다.
- 하위 호환을 깨는 변경(Breaking Change)은 타입 뒤에 `!`를 붙이거나(`feat!:`), 꼬리말에 `BREAKING CHANGE: <설명>`을 추가해서 표시 (MAJOR 버전 상승에 대응). 이때 `BREAKING CHANGE` 토큰 자체는 영어 그대로.
- 한 커밋에는 하나의 논리적 변경만 담고, 타입 대소문자 표기는 일관되게 유지.
- 꼬리말 토큰은 `-`로 단어를 잇는다 (예: `Acked-by`), `BREAKING CHANGE`는 예외.
- PR 제목/본문도 동일하게 국문으로 작성한다.

## PR / 스쿼시 머지 커밋 컨벤션

PR은 **스쿼시 머지**로 병합한다. 즉 PR 하나 = `main`에 남는 커밋 하나이므로, 다음 기준으로 작성한다.

- **제목(헤더)**: `<type>(<도메인/페이지 스코프>): <설명>` 형식, 이 PR에서 **가장 중요한 변경 하나**를 대표로 삼는다.
  - 타입 우선순위: `feat` > `fix` > `chore`/`docs`/`refactor` (semver 영향이 큰 쪽이 우선 — feat는 MINOR, fix는 PATCH에 대응).
  - 스코프는 이전 프로젝트에서 쓰던 도메인/페이지 이름을 그대로 사용 (예: `관리자페이지`, `재생페이지`, `API`). 여러 도메인에 걸치면 콤마로 나열: `feat(관리자페이지, 탐색페이지): ...`. 단일 프로젝트 레포(지금 이 저장소 등)에서는 프로젝트명을 스코프로 반복하지 않고, 세부 영역이 없으면 스코프 자체를 생략한다.
- **본문**: PR 안에 섞인 부수 변경(자잘한 수정, 리팩터링, 스타일 정리 등)은 헤더에 다 담으려 하지 말고 본문에 불릿으로 나열한다.

예시:
```
feat(관리자페이지): 영상 추가 기능 추가

- 카테고리/난이도 변경 로직 정리
- 목록 조회 API 스키마 수정
- 사소한 스타일 정리
```

## 브랜치 전략

간소화한 GitHub Flow를 따른다 (별도 `develop` 브랜치 없음).

- `main`: 항상 배포 가능한 상태를 유지한다.
- `feat/<이름>`: 새 기능. `main`에서 분기한다.
- `fix/<이름>`: 버그 수정. `main`에서 분기한다.
- 새 기능/수정을 시작할 때마다 `main`에서 `feat/*` 또는 `fix/*` 브랜치를 새로 딴다.
- 작업이 끝나면 PR을 올리고 **스쿼시 머지**로 `main`에 합친다 (PR/커밋 컨벤션은 위 항목 참조).
- `develop`을 따로 두지 않는다 — 릴리스를 여러 버전으로 동시 운영하거나 QA 게이트가 긴 릴리스 프로세스가 필요해지기 전까지는, `main`이 곧 배포 기준이 되는 트렁크 기반 구조가 머지 비용을 줄여준다.

## Design System

시각적/UI 결정을 내리기 전에 항상 [DESIGN.md](DESIGN.md)를 먼저 읽는다.
폰트, 컬러, 스페이싱, 톤앤매너는 모두 거기에 정의되어 있다.
사용자의 명시적 승인 없이 이탈하지 않는다.
QA 모드에서는 DESIGN.md와 맞지 않는 코드를 플래그한다.

## 아키텍처 문서 규칙

이 프로젝트의 아키텍처 문서는 [ADR](https://adr.github.io/) · [C4 model](https://c4model.com/) · [arc42](https://arc42.org/)와 [참고 영상](https://www.youtube.com/watch?v=LaLtZsRWFMc)을 참고해 구성했다.

- **폴더 구조**: 시스템 아키텍처 문서는 `docs/architecture/`에 모은다 — `overview.md`(arc42 발췌, 시스템 전체 관점) · `components.md`(C4 Component 레벨, 프론트엔드 상세) · `diagrams/`(C4 다이어그램 원본 `.drawio` + 내보낸 `.png`). ADR은 `docs/adr/`, 요구사항/PRD는 `docs/designs/`, 발표 자료는 `docs/presentation/`에 각각 분리한다.
- **문서 간 위계**: 상세 문서는 상위 문서의 어느 섹션을 상세화하는지 맨 위에 역참조로 명시한다 (예: "이 문서는 [아키텍처 개요] §5.2를 상세화한다"). 상위 문서는 반대로 위임 문구로 하위 문서를 가리킨다.
- **제목·메타데이터**: `# <문서 성격> — <프로젝트명>` 형식을 쓰고, 제목 바로 아래 `**작성일:** ... · **작성자:** ...` 한 줄을 넣는다.
- **헤딩 번호**: 숫자로 통일한다(이모지 등 금지). 하위 섹션은 소수점으로 상위 번호에 종속시킨다(예: `5.1`, `5.2`). arc42처럼 원본 템플릿의 챕터 번호를 발췌해 쓰는 문서는 원본 번호를 그대로 유지한다(연속되지 않아도 됨) — 다만 이 사실 자체를 문서 본문에 설명하지 않는다. arc42/C4 등 참고한 방법론은 이 CLAUDE.md에서만 규칙으로 남기고, 산출물 문서에는 방법론 이름을 노출하지 않는다.
- **표기 통일**: 결정에 대한 근거는 "결정 근거"로 통일해서 쓴다. 표는 항상 마크다운 표 문법을 쓰고 raw HTML `<table>`은 쓰지 않는다.
- **가독성**: 산문 단락보다 문장별 불렛을 기본으로 한다. 표로 나타낼 수 있는 비교·나열은 표를 우선한다.
- **상대 경로**: 문서·이미지·소스 코드 링크는 항상 실제 파일 위치 기준 상대 경로로 쓴다. 문서를 다른 폴더로 옮기면 그 문서 안의 모든 상대 경로를 반드시 같이 갱신한다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
