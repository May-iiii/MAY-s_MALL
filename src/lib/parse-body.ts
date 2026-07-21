import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * 用 Zod schema 解析请求体。
 * 成功返回类型安全的 data；失败返回 400 响应（取第一条中文错误信息）。
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<ParseResult<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: "请求格式错误" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message || "参数校验失败";
    return {
      success: false,
      response: NextResponse.json({ error: message }, { status: 400 }),
    };
  }

  return { success: true, data: result.data };
}
