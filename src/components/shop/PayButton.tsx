"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Props = {
  orderId: string;
  currentStatus: string;
};

export function PayButton({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "支付失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setPaying(false);
    }
  };

  if (currentStatus !== "PENDING") return null;

  return (
    <div>
      <Button onClick={handlePay} disabled={paying}>
        {paying ? "支付中..." : "立即支付"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
