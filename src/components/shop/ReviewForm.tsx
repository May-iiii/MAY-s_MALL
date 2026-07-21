"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  productId: string;
};

export function ReviewForm({ productId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content: content || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(data.error || "提交失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 text-sm text-text-secondary">
        感谢您的评价！
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5">
      <h3 className="font-semibold text-text-primary">发表评价</h3>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl leading-none transition-colors"
            aria-label={`${n} 星`}
          >
            <span className={(hover || rating) >= n ? "text-amber-500" : "text-stone-300"}>
              ★
            </span>
          </button>
        ))}
        <span className="ml-2 text-sm text-text-muted">{rating} 星</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="说说这件商品怎么样（选填）"
        className="input-field mt-3"
      />

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary mt-3 disabled:opacity-50"
      >
        {submitting ? "提交中…" : "提交评价"}
      </button>
    </form>
  );
}
