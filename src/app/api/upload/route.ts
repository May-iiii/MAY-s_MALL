import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// POST /api/upload — 管理员上传商品图片到 Supabase Storage
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG / PNG / WebP / GIF 格式" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = EXT[file.type];
    // 时间戳 + 随机串，避免文件名冲突与路径穿越
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: "上传失败" }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

