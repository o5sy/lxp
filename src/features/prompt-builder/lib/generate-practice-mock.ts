import { usePromptBuilderStore } from "@/store/prompt-builder-store";

const MOCK_INSTRUCTION = `React의 \`useState\`를 사용하면 컴포넌트 내부에서 동적인 데이터를 관리하고 UI에 즉각 반영할 수 있습니다.

이번 실습에서는 입력 필드 상태와 배열 형태의 리스트 상태를 각각 \`useState\`로 선언하고 연동하여, 사용자가 아이템을 추가하고 삭제할 수 있는 쇼핑 리스트 컴포넌트를 직접 작성해봅니다.

## 실습 목표

- \`useState\`를 사용하여 텍스트 입력값과 아이템 배열 상태를 독립적으로 관리할 수 있다.
- 폼 제출 이벤트 발생 시 기존 상태를 유지하면서 새 항목을 안전하게 추가할 수 있다.
- 배열 상태 변경 시 불변성을 유지하며 특정 항목을 삭제할 수 있다.

## 요구 사항

- \`inputText\` 상태를 선언하여 \`<input>\` 요소의 입력값을 제어 컴포넌트(Controlled Component) 형태로 관리하세요.
- \`items\` 상태를 선언하여 쇼핑 리스트 항목 객체 배열을 관리하세요. (각 항목은 \`id\`, \`text\` 속성을 가집니다.)
- 폼 제출 시 입력값이 공백이 아닌 경우 새 아이템을 \`items\` 배열에 추가하고 입력창을 비우세요.
- 각 리스트 항목의 '삭제' 버튼을 클릭하면 해당 \`id\`를 가진 항목이 배열에서 제거되도록 구현하세요.

## 완료 기준

- [ ] 입력창에 글자를 입력하면 state가 업데이트되어 input에 반영된다.
- [ ] '추가' 버튼 클릭 또는 Enter 입력 시 리스트에 새 항목이 추가되고 입력창이 초기화된다.
- 공백만 입력된 상태에서는 항목이 추가되지 않는다.
- 항목 옆의 '삭제' 버튼을 누르면 해당 항목이 목록에서 정상적으로 제거된다.
`;

const MOCK_STARTER_CODE = `import React, { useState } from 'react';

export default function App() {
  // TODO 1: 입력 필드 텍스트를 관리할 useState를 선언하세요.
  // TODO 2: 쇼핑 리스트 배열을 관리할 useState를 선언하세요. (초기값 예시: [{ id: 1, text: '계란' }, { id: 2, text: '우유' }])

  // TODO 3: input 값 변경 핸들러 작성
  const handleInputChange = (e) => {
    // 로직을 작성하세요.
  };

  // TODO 4: 아이템 추가 핸들러 작성 (빈 값 검증 포함)
  const handleAddItem = (e) => {
    e.preventDefault();
    // 로직을 작성하세요.
  };

  // TODO 5: 아이템 삭제 핸들러 작성
  const handleDeleteItem = (id) => {
    // 로직을 작성하세요.
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🛒 쇼핑 리스트</h2>

      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="구매할 물품을 입력하세요"
          style={{ flex: 1, padding: '8px', fontSize: '14px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
          추가
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {/* TODO 6: items 배열을 map으로 순회하며 리스트를 출력하세요. */}
      </ul>
    </div>
  );
}
`;

/**
 * 실제 Gemini API를 호출하지 않고 스토어를 목데이터로 채운다. 개발 중 지시문
 * 렌더링(마크다운 구조, 섹션 레일, 체크리스트 등)을 반복 확인할 때 무료
 * 티어 호출 제한을 소모하지 않기 위한 용도 — 프로덕션 빌드에서는 호출되지
 * 않는다.
 */
export async function generatePracticeMock() {
  const { startGeneration, appendInstruction, setStarterCode, setGenerationDone } = usePromptBuilderStore.getState();

  startGeneration();

  const chunkSize = 12;
  for (let i = 0; i < MOCK_INSTRUCTION.length; i += chunkSize) {
    appendInstruction(MOCK_INSTRUCTION.slice(i, i + chunkSize));
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  setStarterCode(MOCK_STARTER_CODE);
  setGenerationDone();
}
