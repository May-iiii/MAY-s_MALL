"use client";

import React, { useState } from "react";

const accordionItems = [
  {
    id: 1,
    title: "时尚服饰",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "数码好物",
    imageUrl:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=2021&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "家居生活",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "美食饮品",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "图书文创",
    imageUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop",
  },
];

const AccordionItem = ({
  item,
  isActive,
  onMouseEnter,
}: {
  item: (typeof accordionItems)[number];
  isActive: boolean;
  onMouseEnter: () => void;
}) => {
  return (
    <div
      className={`relative h-[420px] cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-700 ease-in-out ${
        isActive ? "w-[380px]" : "w-[60px]"
      }`}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).onerror = null;
          (e.target as HTMLImageElement).src =
            "https://placehold.co/400x450/f2eeeb/1c1917?text=MAY's+Mall";
        }}
      />
      <div className="absolute inset-0 bg-black/25" />
      <span
        className={`absolute whitespace-nowrap text-lg font-semibold text-white transition-all duration-300 ease-in-out ${
          isActive
            ? "bottom-6 left-1/2 -translate-x-1/2 rotate-0"
            : "bottom-24 left-1/2 -translate-x-1/2 rotate-90"
        }`}
      >
        {item.title}
      </span>
    </div>
  );
};

export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState(2);

  return (
    <div className="flex flex-row items-center justify-center gap-3 overflow-x-auto px-4">
      {accordionItems.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}
