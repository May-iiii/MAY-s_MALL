import { prisma } from "./prisma";

export async function getCategories() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: {
        select: {
          products: {
            where: { isPublished: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c._count.products,
  }));
}
