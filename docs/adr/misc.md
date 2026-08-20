# 기타 사항 (아키텍처 방침)

특정 기술 선택이 아니라 LLM 연동 방식에 관한 아키텍처 방침. 기술스택 결정은 [tech-stack.md](tech-stack.md) 참조.

**Status:** Accepted · **Date:** 2026-08-20

---

## LLM 연동은 서버 라우트 경유, 클라이언트 키 노출 금지

**Context:** LLM 호출에는 액세스 토큰(API 키 또는 Hugging Face 토큰)이 필요하다. 클라이언트 번들/환경변수(`NEXT_PUBLIC_*` 등)에 두면 devtools 네트워크 탭이나 번들 소스에서 노출되어 누구나 쿼터를 소진하거나 계정을 정지시킬 수 있다. 이는 스트리밍 여부(완료형 vs 스트리밍)와 무관하게 발생하는 문제다.

**Decision:** 모든 LLM 호출은 Next.js Route Handler를 통해서만 이루어진다. 클라이언트는 구조화된 슬롯 값만 서버로 전송하고, 토큰은 서버 환경변수로만 존재한다.

- 완료형: 서버가 응답을 `await`한 뒤 JSON으로 반환
- 스트리밍: 서버가 LLM 스트림을 받아 `ReadableStream`으로 그대로 파이프

**Consequences:**
- 토큰 노출 리스크 제거. 스트리밍/완료형은 라우트 내부 구현 디테일일 뿐 "서버 라우트 필요"라는 결론을 바꾸지 않음.
- Hugging Face 무료 추론 API의 콜드 스타트(20~60초 지연)가 서버리스 함수 실행시간 제한(Vercel Hobby Node 런타임 기본 10초)에 걸릴 위험 → Route Handler를 Edge Runtime으로 설정하는 것을 우선 검토.
- 모델이 스트리밍 미지원이면 완료형 응답 + 클라이언트 타이핑 효과로 대체(원페이저의 "토큰 단위 렌더링" 요구사항 충족 대안).

## LLM 프로바이더 추상화 인터페이스

**Context:** 사용할 LLM 제공자가 미확정(Hugging Face 무료 모델 탐색 중, 변경 가능성 있음). 제공자 교체 시 UI·상태관리·API 라우트 호출부까지 흔들리면 변경 비용이 커진다.

**Decision:** LLM 호출을 인터페이스 뒤로 숨긴다.

```
lib/llm/
  types.ts       # interface LLMProvider { streamPractice(input): AsyncIterable<string>; streamFeedback(input): AsyncIterable<string> }
  <provider>.ts  # 실제 구현체 (예: huggingface.ts)
  index.ts       # getProvider() — env 변수 하나로 구현체 선택
```

Route Handler는 `getProvider()`만 호출하고 구체적인 모델을 모른다.

**Consequences:**
- 제공자를 바꿔도 `lib/llm/` 안 파일 하나만 교체하면 됨, UI·상태관리·라우트는 그대로.
- Vercel AI SDK를 채택하면 이 추상화의 상당 부분이 SDK 자체에서 제공되므로, 이 인터페이스는 SDK 위에 얇게 얹거나 SDK 없이 직접 구현하는 경우의 안전망 역할을 한다.
