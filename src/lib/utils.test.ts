import { describe, it, expect } from "vitest";
import { cn, formatPrice, slugify, generateOrderNumber, parseJson } from "./utils";

describe("cn", () => {
  it("过滤假值并用空格连接", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
    expect(cn()).toBe("");
  });
});

describe("formatPrice", () => {
  it("带 ¥ 符号和两位小数", () => {
    expect(formatPrice(100)).toBe("¥100.00");
    expect(formatPrice(99.9)).toBe("¥99.90");
    expect(formatPrice(0)).toBe("¥0.00");
  });
});

describe("slugify", () => {
  it("空格转连字符、转小写", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("去除非单词字符", () => {
    expect(slugify("Foo! @Bar#")).toBe("foo-bar");
  });

  it("合并连续连字符", () => {
    expect(slugify("a   b")).toBe("a-b");
  });
});

describe("generateOrderNumber", () => {
  it("符合 ORD-YYYYMMDD-XXXX 格式", () => {
    expect(generateOrderNumber()).toMatch(/^ORD-\d{8}-\d{4}$/);
  });

  it("多次生成大概率不同", () => {
    const set = new Set(Array.from({ length: 50 }, () => generateOrderNumber()));
    // 4 位随机，50 次基本不会全撞，允许极少量重复
    expect(set.size).toBeGreaterThan(40);
  });
});

describe("parseJson", () => {
  it("正常解析", () => {
    expect(parseJson('["a","b"]', [])).toEqual(["a", "b"]);
    expect(parseJson('{"x":1}', {})).toEqual({ x: 1 });
  });

  it("解析失败返回 fallback", () => {
    expect(parseJson("not-json", [])).toEqual([]);
    expect(parseJson("", ["fallback"])).toEqual(["fallback"]);
  });
});
