export function CodeCheckPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
      <button
        type="button"
        disabled
        className="text-faint border-line w-full rounded-md border px-4 py-2 font-mono text-xs disabled:cursor-not-allowed"
      >
        코드 확인받기
      </button>
    </div>
  );
}
