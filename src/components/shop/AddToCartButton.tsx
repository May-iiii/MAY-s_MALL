"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string | null;
  stock: number;
};

export function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  stock,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // TODO: Phase 3 实现购物车逻辑
    let cart;
    try {
      cart = JSON.parse(localStorage.getItem("may-cart") || "[]");
    } catch {
      cart = [];
    }
    const existing = cart.find(
      (item: { productId: string }) => item.productId === productId,
    );
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, stock);
    } else {
      cart.push({
        productId,
        name: productName,
        price: productPrice,
        image: productImage,
        quantity,
        stock,
      });
    }
    localStorage.setItem("may-cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-border">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-2 text-text-secondary hover:bg-surface-secondary"
          disabled={stock <= 0}
        >
          -
        </button>
        <span className="min-w-[2rem] text-center text-sm font-medium">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
          className="px-3 py-2 text-text-secondary hover:bg-surface-secondary"
          disabled={stock <= 0}
        >
          +
        </button>
      </div>
      <Button onClick={handleAddToCart} disabled={stock <= 0} className="flex-1" size="lg">
        {stock <= 0 ? "暂时缺货" : added ? "✓ 已添加" : "加入购物车"}
      </Button>
    </div>
  );
}
