# gstack

이 프로젝트는 [gstack](https://github.com/garrytan/gstack) 스킬 세트를 사용합니다 (`~/.claude/skills/gstack`, team 모드로 설치되어 세션 시작 시 자동 업데이트됨).

## 브라우저 작업 규칙

- 브라우저로 뭔가 확인/테스트해야 할 때, `mcp__claude-in-chrome__*` 도구를 바로 쓰지 말고 **먼저 사용자에게 물어볼 것**: 실제 로그인된 Chrome(`claude-in-chrome`)으로 할지, gstack의 헤드리스 `/browse`로 할지.
- 로그인 세션이 필요 없는 일반적인 QA/스크린샷/폼 테스트라면 `/browse`가 기본값이지만, 그래도 매번 확인 후 진행한다.

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
- 하위 호환을 깨는 변경(Breaking Change)은 타입 뒤에 `!`를 붙이거나(`feat!:`), 꼬리말에 `BREAKING CHANGE: <설명>`을 추가해서 표시 (MAJOR 버전 상승에 대응). 이때 `BREAKING CHANGE` 토큰 자체는 영어 그대로.
- 한 커밋에는 하나의 논리적 변경만 담고, 타입 대소문자 표기는 일관되게 유지.
- 꼬리말 토큰은 `-`로 단어를 잇는다 (예: `Acked-by`), `BREAKING CHANGE`는 예외.
- PR 제목/본문도 동일하게 국문으로 작성한다.
