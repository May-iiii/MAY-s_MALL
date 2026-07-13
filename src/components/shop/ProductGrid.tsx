import { ProductCard } from "./ProductCard";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  image: string | null;
  stock: number;
  category: { name: string; slug: string };
};

type Props = {
  products: Product[];
};

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <svg className="mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-lg">没有找到匹配的商品</p>
        <p className="mt-1 text-sm">试试其他搜索词或筛选条件</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          slug={product.slug}
          name={product.name}
          price={product.price}
          comparePrice={product.comparePrice}
          image={product.image}
          stock={product.stock}
          category={product.category.name}
        />
      ))}
    </div>
  );
}
