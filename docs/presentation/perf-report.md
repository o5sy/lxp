# 성능 지표 리포트 (AI 개발 멘토)

측정일: 2026-08-26
측정 방법론: [ai-adaptive-practice-generator.md § Performance Comparison Methodology](designs/ai-adaptive-practice-generator.md#performance-comparison-methodology) 기준 — 단일 프로덕션 빌드에서 순차 계측 (A/B 빌드 없음)

## 측정 환경

| 항목 | 값 |
|---|---|
| 앱 서버 | `next start` (프로덕션 빌드, `next build` 산출물) |
| Next.js | 16.3.1 (Turbopack) |
| Node.js / npm | v24.11.1 / 11.6.2 |
| OS | macOS 15.6 (24G84) |
| Lighthouse | 13.4.1, HeadlessChrome 151, mobile 프리셋 (기본 시뮬레이션 스로틀링: CPU 4x, RTT 150ms, ~1.6Mbps) |
| LLM | Google Gemini (`gemini-3.6-flash`, `@ai-sdk/google`), `.env.local`에 `GOOGLE_GENERATIVE_AI_API_KEY` 설정 후 **실제 API 호출로 측정** |

## 1. 번들 크기 (라우트별)

Next.js 16(Turbopack)은 기존 `next build`의 "Route / First Load JS" 표를 더 이상 출력하지 않아, 프로덕션 서버에 대해 Lighthouse가 관측한 **실제 전송(transfer) 바이트**를 라우트별 번들 크기로 사용했다.

| 라우트 | 요청 수 | Script 전송량 | Font 전송량 | 전체 전송량 |
|---|---|---|---|---|
| `/` (메인, 프롬프트 빌더) | 9개 스크립트 | 163 KB | 1.2 MB (97개 서브셋 woff2) | 1.45 MB |
| `/practice/[id]` (Sandpack 실행 화면) | 26개 스크립트 | 1.01 MB | 1.2 MB (동일 폰트, 캐시 재사용 가능) | 4.73 MB (그중 3rd-party 43개 요청 · 2.98 MB) |

**관찰:**
- 메인 페이지 자체 JS는 163KB로 가볍다. 페이지 무게의 대부분(1.2MB)은 `next/font`가 생성한 서브셋 폰트 97개 파일이다 — PRD/DESIGN.md에서 쓰는 폰트 패밀리 수·weight·서브셋 범위를 줄이면 가장 큰 절감 효과를 기대할 수 있다.
- `/practice/[id]`는 PRD Open Questions에서 우려했던 대로 **Sandpack의 CodeSandbox 번들러/iframe 인프라 호출(3rd-party 2.98MB)**이 전체 전송량의 63%를 차지한다. `dynamic(..., { ssr: false })`로 이미 지연 로딩은 적용돼 있으나, 로드 자체는 즉시(마운트 시점) 실행되어 무게를 줄이진 못한다.

## 2. Lighthouse (Performance / Accessibility)

| 라우트 | Performance | Accessibility | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|---|
| `/` | 75 | 94 | 0.9s | 10.8s | 20ms | 0 | 1.0s |
| `/practice/[id]` | 74 | 94 | 0.9s | 10.6s | 100ms | 0 | 0.9s |

**LCP/Interactive에 대한 중요한 주석:** 실제 네트워크 요청 타임라인(devtools trace)상으로는 모든 리소스가 localhost에서 150ms 이내에 완료되지만, Lighthouse 기본값인 `simulate` 스로틀링 모드가 모바일 4x CPU + 저속 네트워크를 가정해 LCP/TTI를 훨씬 크게 추정한다(10초대). 즉 위 LCP·TTI 숫자는 "느린 모바일 환경 추정치"이고, 로컬 데스크톱 실사용 체감과는 다르다 — 발표에서는 FCP(0.9s)·CLS(0)·TBT를 실사용 체감 지표로, LCP/TTI는 "모바일 저속 환경 가정치"로 구분해서 제시하는 걸 권장.

Accessibility 94점(두 라우트 동일)은 색상 대비, aria 라벨 등에서 감점 여지가 남아있음을 의미한다. 원본 리포트는 `/tmp/lh-report/main.report.html`, `/tmp/lh-report/practice.report.html`에 있다(임시 경로 — 발표 전 필요하면 `docs/`로 옮겨 보관 권장).

## 3. 첫 상호작용 체감 시간 (TTFT) — 스트리밍 실측

`.env.local`에 실제 `GOOGLE_GENERATIVE_AI_API_KEY`를 설정하고, `/api/practice`에 실제 요청 3회를 보내 **첫 SSE 청크(`instruction-delta`)가 도착하는 시간(TTFT)**과 **전체 생성 완료 시간**을 코드로 직접 측정했다.

| 트라이얼 | 입력 | TTFT (첫 토큰) | 전체 완료 시간 |
|---|---|---|---|
| 1 | concept=useState, stage=apply | 7.65s | 15.24s |
| 2 | concept=useEffect, stage=connect | 13.98s | 18.05s |
| 3 | concept=useEffect, stage=connect | 17.75s | 20.69s |
| **평균** | | **13.13s** | **17.99s** |

**스트리밍 도입 효과 (같은 빌드 내 비교, PRD 방법론 3번 항목):**
같은 빌드·같은 API 호출에서, "완료 후 한 번에 렌더링" 방식이었다면 사용자는 완료 시간(평균 17.99s)까지 아무것도 보지 못한다. 스트리밍 적용 후에는 평균 13.13s 시점부터 지시문이 토큰 단위로 렌더링되기 시작한다 — **평균 4.86초(완료 시간 대비 약 27%) 더 빨리 첫 콘텐츠를 보게 된다.** 다만 절대 TTFT(13초대)가 이미 크고 트라이얼 간 변동(7.6s~17.7s)이 커서, "체감 개선"의 크기는 LLM 응답 자체의 지연/변동성에 크게 좌우된다는 한계가 있다.

## 4. 한계 (발표 시 명시 권장)

- **A/B 빌드 미실시:** PRD 방법론에 따라 별도 빌드 대신 단일 빌드 내 순차 계측으로 대체했다. "스트리밍 전" 상태는 실제 비-스트리밍 빌드가 아니라 동일 데이터의 "완료 시각"으로 근사했다.
- **LLM 응답 변동성:** TTFT가 3회 트라이얼에서 7.65s~17.75s로 편차가 크다(모델: `gemini-3.6-flash`, 네트워크·모델 서버 상태에 따라 변동). 발표에서는 평균값과 함께 이 변동 범위를 함께 제시해야 한다.
- **Lighthouse LCP/TTI 값의 해석:** 기본 모바일 시뮬레이션 스로틀링 때문에 실제 로컬 체감보다 훨씬 나쁘게 나온다(§2 참고). 실사용 체감과 다르다는 점을 청중에게 짚어야 오해가 없다.
- **Sandpack 3rd-party 비중:** `/practice/[id]`의 번들/전송량 대부분이 우리가 작성한 코드가 아니라 외부 임베드(CodeSandbox 번들러) 몫이다. 자체 코드 최적화만으로는 이 부분을 줄이기 어렵다 — PRD의 Approach C 선택(검증된 실행 엔진 재사용)에 따른 트레이드오프로 이미 문서화되어 있다.
- **측정 1회 빌드 기준:** 번들 크기·Lighthouse 모두 이 커밋 시점 1회 빌드 기준이며, 리소스 캐싱 워밍업 없이 첫 로드 기준으로 측정했다.

## 5. 발표 슬라이드용 한 줄 요약

- 메인 페이지 자체 JS 163KB, Lighthouse Performance 75 / Accessibility 94
- `/practice` 화면은 Sandpack 임베드 영향으로 전송량 4.7MB(그중 63%가 외부 임베드) — 알려진 트레이드오프로 문서화됨
- 스트리밍 적용으로 완료 대기(평균 18s) 대신 평균 13.1s부터 콘텐츠 노출 시작 — 체감 대기 약 27% 단축
- 위 모든 수치는 실제 Gemini API 키로 실측한 값 (모킹 아님)
