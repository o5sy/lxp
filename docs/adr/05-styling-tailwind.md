# 스타일링: Tailwind CSS

**Status:** Accepted
**Date:** 2026-08-20

## Context

5일 안에 반응형·상태별(로딩/스트리밍/에러/빈화면/완료) 스타일을 빠르게 구현해야 한다. 작성자가 이미 Tailwind에 익숙하다.

## Decision

**Tailwind CSS를 채택한다.**

## Consequences

- Next.js와의 통합이 표준적으로 지원되어 별도 설정 리스크가 없다.
- shadcn/ui([UI 컴포넌트: shadcn/Radix](06-ui-components-shadcn-radix.md))가 Tailwind 기반이라 궁합이 맞는다.
- DESIGN.md의 터미널 컨셉 토큰(색상·radius·spacing)을 Tailwind 설정(CSS 변수/theme extend)에 매핑해 전역으로 반영한다.
