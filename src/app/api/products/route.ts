import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const result = await getProducts({ search, category, page, pageSize: 9 });

  return NextResponse.json(result);
}
