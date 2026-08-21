#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

npm install

GSTACK_DIR="$HOME/.claude/skills/gstack"
if [ ! -d "$GSTACK_DIR" ]; then
  git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR"
fi

# 브라우저(Playwright Chromium) 다운로드는 이 환경의 네트워크 정책상 실패할 수 있음 —
# gstack 스킬/슬래시커맨드 등록 자체는 이 단계와 무관하므로 실패해도 세션 시작을 막지 않는다.
(cd "$CLAUDE_PROJECT_DIR" && "$GSTACK_DIR/setup" --team) || true
