import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { runRubric, type CapturedSample } from "./rubric";

const FIXTURES_DIR = path.join(process.cwd(), "fixtures", "practice-samples");

async function loadSamples(): Promise<{ file: string; sample: CapturedSample }[]> {
  let files: string[];
  try {
    files = (await readdir(FIXTURES_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    files = [];
  }

  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(FIXTURES_DIR, file), "utf-8");
      return { file, sample: JSON.parse(raw) as CapturedSample };
    }),
  );
}

async function main() {
  const entries = await loadSamples();

  if (entries.length === 0) {
    console.error(
      `${path.relative(process.cwd(), FIXTURES_DIR)}에 캡처된 샘플이 없습니다. 먼저 "npm run capture:samples"를 실행하세요.`,
    );
    process.exitCode = 1;
    return;
  }

  let hasErrorFailure = false;
  const ruleFailureCounts = new Map<string, number>();

  for (const { file, sample } of entries) {
    const results = runRubric(sample);
    const failed = results.filter((r) => !r.pass);

    console.log(
      `\n=== ${file} (${sample.input.concept} / ${sample.input.difficulty} / status=${sample.output.status}) ===`,
    );
    if (failed.length === 0) {
      console.log("  모든 규칙 통과");
    } else {
      for (const result of failed) {
        const tag = result.severity === "error" ? "FAIL" : "WARN";
        console.log(`  [${tag}] ${result.id} — ${result.description}${result.detail ? ` (${result.detail})` : ""}`);
        ruleFailureCounts.set(result.id, (ruleFailureCounts.get(result.id) ?? 0) + 1);
        if (result.severity === "error") hasErrorFailure = true;
      }
    }
  }

  console.log(`\n=== 요약 (샘플 ${entries.length}건) ===`);
  if (ruleFailureCounts.size === 0) {
    console.log("모든 샘플이 모든 규칙을 통과했습니다.");
  } else {
    for (const [id, count] of ruleFailureCounts) {
      console.log(`  ${id}: ${count}/${entries.length}건 실패`);
    }
  }

  process.exitCode = hasErrorFailure ? 1 : 0;
}

main();
