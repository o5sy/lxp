# 프레임워크: Next.js (App Router)

**Status:** Accepted
**Date:** 2026-08-20

## Context

이번 프로젝트(5일)는 화면 하나짜리 앱이라 SSR/라우팅 등 Next.js의 대표 기능은 필요 없다. 하지만 LLM 호출용 API 키(또는 토큰)를 클라이언트에 두면 브라우저에서 그대로 노출되어 유출·악용(과금 폭탄, 쿼터 소진) 리스크가 있으므로, 키를 서버에서만 다루는 경로가 반드시 필요하다.

비교 대상: Vite + React(SPA) + 별도 서버리스 함수(Vercel Functions 폴더 또는 Cloudflare Worker).

## Decision

**Next.js (App Router)를 채택한다.** Route Handler(`app/api/*/route.ts`)를 키 보호·LLM 프록시 지점으로 사용하며, 프론트엔드와 서버 코드를 하나의 프로젝트/배포로 합친다.

## Consequences

- 별도 백엔드 레포/인프라 없이 프로젝트 하나로 키 보호와 스트리밍 프록시를 해결한다.
- Route Handler가 `ReadableStream`을 네이티브로 반환해 스트리밍 UI 요구사항과 맞물린다.
- Vercel 배포와 zero-config로 이어진다([배포: Vercel](02-deployment-vercel.md) 참조).
- 트레이드오프: App Router의 라우팅/SSR 기능 대부분은 이번 스코프에서 쓰이지 않는다 — 채택 이유는 SSR이 아니라 "서버 코드를 어디 두느냐" 문제의 최소 해법이기 때문임을 명확히 해둔다. Vite+React+별도 서버리스 함수로도 동일하게 풀 수 있으나, 그 경우 배포 타깃이 두 개로 늘어난다.
