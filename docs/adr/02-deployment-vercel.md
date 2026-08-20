# 배포: Vercel

**Status:** Accepted
**Date:** 2026-08-20

## Context

Next.js([프레임워크: Next.js](01-framework-nextjs.md)) 기반 앱을 배포할 플랫폼이 필요하다. 비교 대상: Vercel vs Cloudflare Pages.

| 기준 | Vercel | Cloudflare Pages |
|---|---|---|
| Next.js 지원 | 네이티브, zero-config | `@cloudflare/next-on-pages` 어댑터 필요, 일부 Route Handler 기능 미지원/부분지원 |
| 런타임 | Node.js 런타임 선택 가능 | 기본이 Workers(V8 isolate), Node API 제약 |
| 스트리밍 | AI SDK/커스텀 스트림과 바로 호환 | 어댑터 계층을 통과해야 함 |
| 무료 티어(이 규모) | 충분 | 충분 |
| 엣지 지연시간/글로벌 성능 | 보통 | 강점 |
| 스케일 시 비용 | 상대적으로 비쌈 | 저렴한 편 |

## Decision

**Vercel을 채택한다.**

## Consequences

- Cloudflare의 강점(엣지 지연시간, 스케일 비용)은 5일짜리 발표용 프로젝트 규모에서 체감되지 않는다.
- Next.js+어댑터 조합에서 발생할 수 있는 "왜 스트리밍이 안 되지" 류의 디버깅 리스크를 회피한다.
- 이 선택은 "Vercel이 일반적으로 우월해서"가 아니라 "이 프로젝트 규모에서 어댑터 리스크가 없어서"라는 점을 명시한다 — 프로젝트가 커지고 비용/지연시간이 실제 이슈가 되면 재검토 대상이다.
