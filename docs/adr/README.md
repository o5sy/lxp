# ADR (Architecture Decision Records)

AI 맞춤 실습 생성기 프로젝트의 기술스택/아키텍처 결정 기록. 각 ADR은 [Michael Nygard 포맷](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)(Context / Decision / Consequences)을 따른다.

관련 문서: [PRD](../designs/ai-adaptive-practice-generator.md) · [원페이저](../designs/onepager-submission.md) · [DESIGN.md](../../DESIGN.md)

## 기술스택

| # | 제목 |
|---|---|
| [01](01-framework-nextjs.md) | 프레임워크: Next.js (App Router) |
| [02](02-deployment-vercel.md) | 배포: Vercel |
| [03](03-folder-structure-feature-based.md) | 폴더 구조: 기능별 슬라이스 (Lite FSD) |
| [04](04-state-management-zustand.md) | 전역 상태: Zustand |
| [05](05-styling-tailwind.md) | 스타일링: Tailwind CSS |
| [06](06-ui-components-shadcn-radix.md) | UI 컴포넌트: shadcn/ui (Radix 기반) |
| [07](07-code-execution-sandpack.md) | 코드 실행: Sandpack |

## 기타 방침

| 문서 | 내용 |
|---|---|
| [misc.md](misc.md) | LLM 서버 프록시 정책 · LLM 프로바이더 추상화 |

## 미결정 (Open / Deferred)

- **LLM 모델/제공자**: Anthropic API가 아닌 Hugging Face 무료 모델을 탐색 중 (claude.ai 구독은 API 접근권이 아님을 확인함). 모델 확정 전까지 보류.
- **Vercel AI SDK 채택 여부**: 스트리밍 UI 상태 관리 보일러플레이트를 줄여주지만, 공식 지원 provider 목록에 Hugging Face가 없을 가능성이 있어 모델 확정 후 재검토. 모델이 스트리밍 미지원이면 완료형 응답 + 클라이언트 타이핑 효과로 대체.
