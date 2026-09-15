import { describe, expect, it } from "vitest";

import { findClosestKeyword, isLocallyRecognized } from "./index";

describe("isLocallyRecognized", () => {
  it("빈 문자열은 인식하지 않는다", () => {
    expect(isLocallyRecognized("")).toBe(false);
  });

  it("공백만 있는 문자열은 인식하지 않는다", () => {
    expect(isLocallyRecognized("   ")).toBe(false);
  });

  it("화이트리스트 키워드와 정확히 일치하면 인식한다", () => {
    expect(isLocallyRecognized("useState")).toBe(true);
  });

  it("대소문자를 무시하고 매치한다", () => {
    expect(isLocallyRecognized("USESTATE")).toBe(true);
  });

  it("키워드를 포함하는 더 긴 문장도 인식한다", () => {
    expect(isLocallyRecognized("리액트 useState 훅 사용법")).toBe(true);
  });

  it("키워드의 일부만 타이핑한 경우(부분 문자열)는 인식하지 않는다", () => {
    // "useSt"는 "useState"의 앞부분일 뿐 키워드 전체를 포함하지 않는다.
    expect(isLocallyRecognized("useSt")).toBe(false);
  });

  it("아주 짧은 조각이 우연히 여러 키워드의 부분 문자열이어도 인식하지 않는다", () => {
    // "us"는 useState/useEffect 등 여러 키워드에 부분 문자열로 포함되지만
    // 그 자체로는 키워드 전체를 포함하지 않으므로 인식되면 안 된다.
    expect(isLocallyRecognized("us")).toBe(false);
  });

  it("화이트리스트에 없는 개념은 인식하지 않는다 (부적합 판정과는 무관)", () => {
    // 인식 안 됨 != 부적합. 화이트리스트에 없는 정상 개념일 수 있다.
    expect(isLocallyRecognized("웹 접근성")).toBe(false);
  });

  it("코드 실습으로 옮길 수 없는 개념도 화이트리스트 관점에서는 그냥 미인식이다", () => {
    expect(isLocallyRecognized("하네스 엔지니어링")).toBe(false);
  });
});

describe("findClosestKeyword", () => {
  it("키워드에 아주 가까운 오타/미완성 입력은 보정 후보를 제안한다", () => {
    expect(findClosestKeyword("useStat")).toBe("useState");
  });

  it("이미 완전히 매치되는 입력에는 제안하지 않는다", () => {
    expect(findClosestKeyword("useState")).toBeNull();
  });

  it("너무 짧은 입력(2자 이하)에는 제안하지 않는다", () => {
    expect(findClosestKeyword("us")).toBeNull();
  });

  it("어떤 키워드와도 충분히 가깝지 않으면 제안하지 않는다", () => {
    expect(findClosestKeyword("하네스 엔지니어링")).toBeNull();
  });

  it("화이트리스트에 없는 정상 개념에는 제안하지 않는다", () => {
    expect(findClosestKeyword("웹 접근성")).toBeNull();
  });
});
