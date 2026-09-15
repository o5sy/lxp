import { describe, expect, it } from "vitest";

import { parseSSE } from "./parse-sse";

function makeResponse(chunks: (string | Uint8Array)[]): Response {
  const encoder = new TextEncoder();
  const encoded = chunks.map((chunk) =>
    typeof chunk === "string" ? encoder.encode(chunk) : chunk,
  );
  let index = 0;

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < encoded.length) {
        controller.enqueue(encoded[index]);
        index += 1;
      } else {
        controller.close();
      }
    },
  });

  return new Response(stream);
}

async function collect(response: Response) {
  const events: { event: string; data: string }[] = [];
  for await (const event of parseSSE(response)) {
    events.push(event);
  }
  return events;
}

describe("parseSSE", () => {
  it("정상적인 SSE 이벤트를 event/data 쌍으로 파싱한다", async () => {
    const response = makeResponse(['event: delta\ndata: "안녕"\n\nevent: done\ndata: ""\n\n']);

    await expect(collect(response)).resolves.toEqual([
      { event: "delta", data: "안녕" },
      { event: "done", data: "" },
    ]);
  });

  it("하나의 이벤트가 여러 read() 청크에 걸쳐 나뉘어 와도 버퍼링으로 합쳐 파싱한다", async () => {
    const response = makeResponse(["event: delta\ndata: ", '"hel', 'lo"\n\n']);

    await expect(collect(response)).resolves.toEqual([{ event: "delta", data: "hello" }]);
  });

  it("멀티바이트(한글) 문자가 청크 경계 중간에서 잘려도 깨지지 않는다", async () => {
    const prefix = 'event: delta\ndata: "';
    const koreanText = "안녕하세요";
    const suffix = '"\n\n';

    const encoder = new TextEncoder();
    const prefixBytes = encoder.encode(prefix);
    const fullBytes = encoder.encode(prefix + koreanText + suffix);

    // 한글 한 글자는 UTF-8에서 3바이트이므로, 여는 따옴표 직후 문자 하나를 1바이트만 잘라 보낸다.
    const splitPoint = prefixBytes.length + 1;
    const response = makeResponse([fullBytes.slice(0, splitPoint), fullBytes.slice(splitPoint)]);

    await expect(collect(response)).resolves.toEqual([{ event: "delta", data: koreanText }]);
  });

  it("event 또는 data 라인 중 하나가 빠진 불완전한 이벤트는 무시한다", async () => {
    const response = makeResponse([
      'event: delta\n\ndata: "no-event"\n\nevent: done\ndata: ""\n\n',
    ]);

    await expect(collect(response)).resolves.toEqual([{ event: "done", data: "" }]);
  });

  it("빈 스트림이면 아무 이벤트도 만들지 않는다", async () => {
    const response = makeResponse([]);

    await expect(collect(response)).resolves.toEqual([]);
  });
});
