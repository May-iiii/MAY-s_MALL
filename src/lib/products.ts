import { prisma } from "./prisma";

type GetProductListParams = {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  isPublished?: boolean;
};

export async function getProducts(params: GetProductListParams) {
  const { search = "", category = "", page = 1, pageSize = 9, isPublished = true } = params;

  const where: Record<string, unknown> = {};

  if (isPublished) {
    where.isPublished = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        image: true,
        stock: true,
        category: { select: { name: true, slug: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}
