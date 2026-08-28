# 성능·접근성 리포트 — AI 개발 멘토

**작성일:** 2026-08-28 · **작성자:** 오승연

이 문서는 [아키텍처 개요](architecture/overview.md) §1.2 품질 요구사항의 접근성·성능 항목을 상세화한다. 측정 방법론은 [PRD § Performance Comparison Methodology](designs/ai-adaptive-practice-generator.md#performance-comparison-methodology)를 따르며, 측정 원본 데이터는 발표자료용으로 정리된 [presentation/perf-report.md](presentation/perf-report.md) 및 [presentation/lighthouse-reports/](presentation/lighthouse-reports/)의 원본 Lighthouse 리포트를 근거로 한다. 이 문서는 그 데이터를 제출 산출물 형태로 재구성하고, 접근성 실패 항목 상세·판정 기준·재현 방법·개선 방향을 추가한 것이다.

## 1. 측정 환경

측정은 2026-08-26, 소스 변경 없는 동일 커밋 기준으로 이뤄졌다 (이후 `src/` 변경 이력 없음 — 수치 재사용 유효).

| 항목 | 값 |
|---|---|
| 앱 서버 | `next start` (프로덕션 빌드, `next build` 산출물) |
| Next.js | 16.3.1 (Turbopack) |
| Node.js / npm | v24.11.1 / 11.6.2 |
| OS | macOS 15.6 (24G84) |
| Lighthouse | 13.4.1, HeadlessChrome 151, mobile 프리셋 (기본 시뮬레이션 스로틀링: CPU 4x, RTT 150ms, ~1.6Mbps) |
| LLM | Google Gemini (`gemini-3.6-flash`, `@ai-sdk/google`), 실제 API 호출로 측정 (모킹 아님) |

## 2. 측정 기준

숫자를 어떻게 판정했는지 먼저 명시한다.

### 2.1 접근성 판정 기준

- **목표:** Lighthouse Accessibility ≥ 90점 (아키텍처 개요 §1.2와 동일 기준).
- **적용 범위:** Lighthouse Accessibility 카테고리는 WCAG 2.1 A/AA 항목 중 자동으로 검증 가능한 항목만 커버한다(색상 대비, 랜드마크, aria 속성, 폼 라벨 등 약 40개 자동 체크). 키보드 포커스 순서·스크린리더 실사용성 등은 `scoreDisplayMode: manual`로 표시되는 수동 검토 항목이라 이번 리포트의 자동 판정 범위에서 제외했다 — 실제 실패로 집계하지 않되, 한계로 남긴다.
- **색상 대비 기준:** WCAG 1.4.3 — 일반 텍스트 4.5:1 이상, 큰 텍스트(18pt 이상 또는 14pt bold 이상)·비텍스트 요소 3:1 이상.

### 2.2 성능 판정 기준

Google Core Web Vitals 공식 임계값을 그대로 채택했다.

| 지표 | Good | Needs Improvement | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s ~ 4s | ≥ 4s |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 ~ 0.25 | ≥ 0.25 |
| TBT (Total Blocking Time) | < 200ms | 200ms ~ 600ms | ≥ 600ms |

Lighthouse Performance 종합 점수는 0-49 저조 / 50-89 개선 필요 / 90-100 양호 구간으로 해석한다. **주의:** Lighthouse 기본 `simulate` 스로틀링(모바일 4x CPU + 저속 네트워크 가정)은 로컬 실사용 체감보다 LCP/TTI를 훨씬 크게 추정한다 — §7 한계 참고.

## 3. 접근성 리포트

### 3.1 종합 점수

| 라우트 | Accessibility | 자동 체크 통과 | 자동 체크 실패 |
|---|---|---|---|
| `/` | 94/100 (목표 90 달성) | 약 38개 | 2개 |
| `/practice/[id]` | 94/100 (목표 90 달성) | 약 38개 | 2개 |

### 3.2 실패 항목 상세

| 라우트 | 감사 항목 | WCAG 기준 | 해당 요소 |
|---|---|---|---|
| `/` | `color-contrast` | 1.4.3 (4.5:1 미달) | 1개 — `p.text-faint.font-mono.text-xs` (`div.w-full > div.flex > div.flex > p.text-faint`) |
| `/` | `landmark-one-main` | 1.3.1 관련 모범 사례 | `<html lang="ko">` 전체 — 문서에 `<main>` 랜드마크 없음 |
| `/practice/[id]` | `color-contrast` | 1.4.3 (4.5:1 미달) | 3개 — `header.bg-titlebar` 내 `p.text-muted-foreground.font-mono.text-xs`, `div.border-line > div.flex` 내 `p.text-faint` 2곳 |
| `/practice/[id]` | `landmark-one-main` | 1.3.1 관련 모범 사례 | `<html>` 전체 — 동일하게 `<main>` 랜드마크 없음 |

## 4. 성능 리포트

### 4.1 번들 크기 (라우트별)

Next.js 16(Turbopack)이 `next build`의 "Route / First Load JS" 표를 더 이상 출력하지 않아, 프로덕션 서버에 대해 Lighthouse가 관측한 실제 전송(transfer) 바이트를 라우트별 번들 크기로 썼다.

| 라우트 | 요청 수 | Script 전송량 | Font 전송량 | 전체 전송량 |
|---|---|---|---|---|
| `/` (메인, 프롬프트 빌더) | 9개 스크립트 | 163 KB | 1.2 MB (97개 서브셋 woff2) | 1.45 MB |
| `/practice/[id]` (Sandpack 실행 화면) | 26개 스크립트 | 1.01 MB | 1.2 MB (동일 폰트, 캐시 재사용 가능) | 4.73 MB (3rd-party 43개 요청 · 2.98 MB 포함) |

### 4.2 Lighthouse 점수 및 Core Web Vitals 판정

| 라우트 | Performance | FCP | LCP | 판정 | TBT | 판정 | CLS | 판정 | Speed Index |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 75 (개선 필요) | 0.9s | 10.8s | Poor | 20ms | Good | 0 | Good | 1.0s |
| `/practice/[id]` | 74 (개선 필요) | 0.9s | 10.6s | Poor | 100ms | Good | 0 | Good | 0.9s |

CLS·TBT는 기준을 넉넉히 충족한다. LCP만 Poor로 판정되는데, 이는 §2.2에서 명시한 모바일 시뮬레이션 스로틀링의 영향이 커서 실사용 체감과 다르다 — §7 한계에서 구분해 다룬다.

### 4.3 진단 상세 (opportunity/diagnostic)

| 라우트 | 항목 | 원인 | 예상 절감치 |
|---|---|---|---|
| `/` | `largest-contentful-paint` | LCP 10.8s — Performance 점수의 주요 감점 원인 | - |
| `/` | `render-blocking-insight` | 렌더링을 막는 요청 존재 | ~260ms |
| `/` | `network-dependency-tree-insight` | 긴 critical-path 의존성 체인 | - |
| `/` | `unused-javascript` | 미사용 JS 포함 | ~50 KiB / ~300ms |
| `/` | `legacy-javascript-insight` | 불필요한 ES5 트랜스폼/폴리필 | ~13 KiB |
| `/practice/[id]` | `largest-contentful-paint` | LCP 10.6s | - |
| `/practice/[id]` | `render-blocking-insight` | 렌더링을 막는 요청 존재 | ~280ms |
| `/practice/[id]` | `network-dependency-tree-insight` | 긴 critical-path 의존성 체인 | - |
| `/practice/[id]` | `unused-javascript` | 미사용 JS 포함 (Sandpack 번들 비중 큼) | ~195 KiB / ~300ms |
| `/practice/[id]` | `total-byte-weight` | 전체 페이지 무게 4,616 KiB | - |
| `/practice/[id]` | `cache-insight` | 캐시 유효기간이 짧은 리소스 존재 | ~12 KiB |
| `/practice/[id]` | `legacy-javascript-insight` | 불필요한 ES5 트랜스폼/폴리필 | ~13 KiB |
| `/practice/[id]` | `bf-cache` | 뒤로/앞으로가기 캐시 복원 차단 (원인: Sandpack iframe의 unload handler, `UnloadHandlerExistsInSubFrame`) | - |

### 4.4 스트리밍 적용 전후 TTFT 비교 (실측)

`.env.local`에 실제 `GOOGLE_GENERATIVE_AI_API_KEY`를 설정하고 `/api/practice`에 실제 요청 3회를 보내, 첫 SSE 청크(`instruction-delta`)가 도착하는 시간(TTFT)과 전체 생성 완료 시간을 코드로 직접 측정했다.

| 트라이얼 | 입력 | TTFT (첫 토큰) | 전체 완료 시간 |
|---|---|---|---|
| 1 | concept=useState, stage=apply | 7.65s | 15.24s |
| 2 | concept=useEffect, stage=connect | 13.98s | 18.05s |
| 3 | concept=useEffect, stage=connect | 17.75s | 20.69s |
| 평균 | | 13.13s | 17.99s |

같은 빌드·같은 API 호출 기준으로, "완료 후 한 번에 렌더링" 방식이었다면 사용자는 평균 17.99s까지 아무것도 보지 못한다. 스트리밍 적용 후에는 평균 13.13s 시점부터 지시문이 토큰 단위로 렌더링되기 시작해, 평균 4.86초(완료 시간 대비 약 27%) 더 빨리 첫 콘텐츠를 보게 된다.

## 5. 측정 방법 재현 가이드

### 5.1 Lighthouse (성능·접근성)

```bash
npm run build
npm run start
# 새 터미널에서 (서버가 http://localhost:3000 에서 대기 중이어야 함)
npx lighthouse http://localhost:3000 --preset=mobile --output=html --output-path=./main.report.html
npx lighthouse http://localhost:3000/practice/repro-test --preset=mobile --output=html --output-path=./practice.report.html
```

`/practice/[id]`는 클라이언트 상태(Zustand)에 의존하는 화면이라, 프롬프트 빌더(`/`)에서 실제로 실습을 하나 생성한 뒤 발급된 `id`로 접속해야 실제 콘텐츠가 렌더링된 상태를 측정할 수 있다. 임의의 `id`로 접속하면 빈 상태 UI가 측정된다.

### 5.2 TTFT (스트리밍 첫 토큰 지연)

사전 준비: `.env.local`에 `GOOGLE_GENERATIVE_AI_API_KEY` 설정.

**curl로 빠르게 확인** (`-N`으로 버퍼링 없이 SSE 스트림을 그대로 출력, 각 줄 앞 타임스탬프는 `ts` 유틸 또는 아래 Node 스니펫으로 대체 가능):

```bash
curl -N -X POST http://localhost:3000/api/practice \
  -H "Content-Type: application/json" \
  -d '{"concept":"useState","difficulty":"apply","freeText":""}'
```

**정밀 측정용 Node 스니펫** (TTFT·전체 완료 시간을 밀리초 단위로 출력):

```js
const start = performance.now();
const res = await fetch("http://localhost:3000/api/practice", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ concept: "useState", difficulty: "apply", freeText: "" }),
});
const reader = res.body.getReader();
let firstChunkAt = null;
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  if (firstChunkAt === null) firstChunkAt = performance.now();
}
console.log("TTFT(ms):", firstChunkAt - start);
console.log("전체 완료(ms):", performance.now() - start);
```

## 6. 개선 방향

### 6.1 접근성

- **`color-contrast` (4건):** `text-faint`는 [DESIGN.md](../DESIGN.md#decisions-log) Decisions Log에 실측 대비비 2.66:1로 이미 문서화돼 있다 — WCAG AA 소형 텍스트 기준(4.5:1)에 못 미친다. DESIGN.md는 라이트모드 스텝2 항목 등 다른 위치에서 같은 문제를 `text-muted-foreground/80`(3.22:1→AA 충족 대체 토큰) 방식으로 이미 해결한 전례가 있으므로, 이번에 걸린 4곳(`/`의 라벨 텍스트, `/practice`의 titlebar·구분선 라벨)에도 같은 패턴(불투명도 낮추기 대신 AA를 만족하는 톤으로 치환)을 적용하는 것을 권장한다. `text-muted-foreground`가 쓰인 titlebar 항목은 실제 배경색 기준 대비비를 DevTools로 재측정한 뒤 조정 폭을 정해야 한다(정확한 수치 미확인).
- **`landmark-one-main` (2건):** 두 라우트 모두 `<main>` 랜드마크가 없다. 각 페이지 최상위 콘텐츠 컨테이너를 `<main>`으로 감싸는 것으로 해결 가능하며, 레이아웃 변경 없이 태그만 바꾸면 되는 낮은 리스크의 수정이다.

### 6.2 성능

- **폰트 (1.2MB, 97개 서브셋):** `src/app/layout.tsx`에서 이미 4개 폰트 모두 `subsets: ["latin"]`로 제한돼 있음에도 97개 파일이 생성된다 — 4개 서체(Fraunces/Instrument Sans/JetBrains Mono/Nanum Gothic Coding)를 모든 라우트에 전역으로 로드하는 구조가 원인일 가능성이 크다. 라우트별로 실제 쓰이는 폰트만 로드하도록 스코프를 좁히는 방향(예: Fraunces italic은 `/`에서만, JetBrains Mono는 `/practice`에서만)을 검토할 가치가 있다.
- **`unused-javascript`:** `/`는 ~50KiB, `/practice/[id]`는 ~195KiB — practice 쪽은 Sandpack 번들 비중이 클 것으로 추정된다. 번들 분석(`next build --profile` 또는 `@next/bundle-analyzer`)으로 실제 미사용 모듈을 특정해야 한다.
- **Sandpack 로딩 전략:** 현재 `dynamic(..., { ssr: false })`는 지연 로딩이지 무게 절감이 아니다 — 마운트 시점에 곧바로 2.98MB 3rd-party 리소스를 받아온다. 체감 개선을 위해 스켈레톤/플레이스홀더를 먼저 보여주고 Sandpack 초기화를 그 뒤로 미루는 방식을 검토할 수 있다. 다만 전송량 자체를 줄이긴 어렵다 — [ADR07](adr/07-code-execution-sandpack.md)에서 이미 검증된 실행 엔진 재사용의 트레이드오프로 문서화된 부분이다.
- **`bf-cache`:** Sandpack iframe이 unload handler를 갖고 있어 뒤로/앞으로가기 캐시 복원이 구조적으로 막힌다. Sandpack을 임베드로 쓰는 한 우리 코드로 해결하기 어려운 3rd-party 제약이다.

## 7. 한계

- **A/B 빌드 미실시:** PRD 방법론에 따라 별도 빌드 대신 단일 빌드 내 순차 계측으로 대체했다. "스트리밍 전" 상태는 실제 비-스트리밍 빌드가 아니라 동일 데이터의 "완료 시각"으로 근사했다.
- **LLM 응답 변동성:** TTFT가 3회 트라이얼에서 7.65s~17.75s로 편차가 크다(모델: `gemini-3.6-flash`, 네트워크·모델 서버 상태에 따라 변동).
- **Lighthouse LCP/TTI 값의 해석:** 기본 모바일 시뮬레이션 스로틀링 때문에 실제 로컬 체감보다 훨씬 나쁘게 나온다(§2.2 참고).
- **Sandpack 3rd-party 비중:** `/practice/[id]`의 번들/전송량 대부분이 자체 코드가 아니라 외부 임베드(CodeSandbox 번들러) 몫이다. 자체 코드 최적화만으로는 줄이기 어렵다.
- **bf-cache 제약:** Sandpack iframe의 unload handler로 인한 구조적 제약 — §6.2 참고.
- **접근성 자동 검증의 한계:** Lighthouse 자동 체크가 커버하지 못하는 수동 검토 항목(키보드 포커스 순서, 실제 스크린리더 사용성 등)은 이번 리포트에서 검증하지 않았다.
- **측정 1회 빌드 기준:** 번들 크기·Lighthouse 모두 이 커밋 시점 1회 빌드 기준이며, 리소스 캐싱 워밍업 없이 첫 로드 기준으로 측정했다.

## 8. 결론

두 라우트 모두 접근성 목표(Lighthouse ≥ 90점)는 94점으로 달성했다. 자동 검증 가능한 약 40개 체크 중 실패는 라우트당 2건(색상 대비, `<main>` 랜드마크 부재)뿐이고, 둘 다 원인이 명확하고 수정 범위가 좁아 낮은 리스크로 해결 가능하다.

성능은 Performance 점수 74~75점으로 "개선 필요" 구간이며, CLS·TBT는 기준을 넉넉히 충족하지만 LCP가 Poor로 판정된다. 다만 이 LCP 수치는 Lighthouse의 모바일 저속 네트워크 시뮬레이션을 반영한 추정치로, 실제 로컬 환경 체감(FCP 0.9s)과는 괴리가 있다는 점을 함께 봐야 한다. `/practice/[id]`의 무거운 전송량(4.73MB)은 대부분 Sandpack 임베드라는 알려진 트레이드오프이며, 스트리밍 도입으로 체감 대기 시간을 완료 시점 대비 평균 27% 앞당긴 것은 실측으로 확인됐다.
