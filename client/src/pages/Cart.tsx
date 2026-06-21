import { Trash2, Plus, Minus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { useTelegram } from "@/hooks/useTelegram";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface EnrichedCartItem {
  id: number;
  telegramUserId: string;
  productId: number;
  size: string | null;
  quantity: number;
  product: Product | undefined;
}

// Открыть чат с владельцем магазина с заготовленным сообщением
function openOwnerChat(text: string, tg: Window["Telegram"]["WebApp"] | undefined) {
  const adminTg = (import.meta as any).env?.VITE_ADMIN_TG as string | undefined;
  if (!adminTg) {
    alert("Владелец магазина не настроен. Установите VITE_ADMIN_TG.");
    return;
  }
  const url = `https://t.me/${adminTg}?text=${encodeURIComponent(text)}`;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

export function Cart() {
  const { userId, tg } = useTelegram();

  const { data: items = [], isLoading } = useQuery<EnrichedCartItem[]>({
    queryKey: ["/api/cart", userId],
    queryFn: () => fetch(`/api/cart/${userId}`).then((r) => r.json()),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cart/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] }),
  });

  const updateQtyMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      apiRequest("PATCH", `/api/cart/${id}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] }),
  });

  // "Оформить заказ" — открывает чат с владельцем, перечисляет все товары
  function handleCheckout() {
    if (items.length === 0) return;

    const lines = items.map((item) => {
      const name = item.product?.name ?? "Товар";
      const size = item.size ? ` (EU ${item.size})` : "";
      const price = ((item.product?.price ?? 0) * item.quantity).toLocaleString("ru-RU");
      return `👟 ${name}${size} × ${item.quantity} — ${price} ₽`;
    });

    const total = items
      .reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0)
      .toLocaleString("ru-RU");

    const text =
      `Хочу купить:\n\n` +
      lines.join("\n") +
      `\n\n💰 Итого: ${total} ₽`;

    openOwnerChat(text, tg);
  }

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <MobileShell>
        <div className="relative w-[393px] min-h-screen bg-white pb-36">
          <div className="h-[54px]" />
          <div className="px-4 space-y-3 mt-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-[90px] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="relative w-[393px] min-h-screen bg-white pb-36">
        <div className="h-[54px]" />

        <div className="px-4 mb-6">
          <h1 className="text-[#3c3c3c] text-[22px] font-bold tracking-[-0.5px]">
            Корзина
          </h1>
          {items.length > 0 && (
            <p className="text-[#7b7b7b] text-[13px] mt-1 tracking-[-0.3px]">
              {items.length}{" "}
              {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 px-8">
            <div className="text-[56px]">🛍️</div>
            <p className="text-[#3c3c3c] text-[18px] font-bold mt-4 text-center tracking-[-0.4px]">
              Корзина пуста
            </p>
            <p className="text-[#7b7b7b] text-[13px] mt-2 text-center">
              Добавьте товары из каталога
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-[#f5f7ff] rounded-2xl p-3"
                >
                  <div className="w-[80px] h-[70px] bg-white rounded-2xl flex items-center justify-center shrink-0">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-[60px] object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3c3c3c] text-[12px] font-medium tracking-[-0.3px] truncate">
                      {item.product?.name ?? "Товар"}
                    </p>
                    {item.size && (
                      <p className="text-[#7b7b7b] text-[11px] mt-0.5">EU {item.size}</p>
                    )}
                    <p className="text-[#3c3c3c] text-[16px] font-bold mt-1 tracking-[-0.4px]">
                      {((item.product?.price ?? 0) * item.quantity).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeMutation.mutate(item.id)}>
                      <Trash2 size={16} className="text-[#7b7b7b]" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) removeMutation.mutate(item.id);
                          else
                            updateQtyMutation.mutate({
                              id: item.id,
                              quantity: item.quantity - 1,
                            });
                        }}
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center"
                      >
                        <Minus size={12} className="text-[#3c3c3c]" />
                      </button>
                      <span className="text-[#3c3c3c] text-[13px] font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQtyMutation.mutate({
                            id: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center"
                      >
                        <Plus size={12} className="text-[#3c3c3c]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-[74px] left-1/2 -translate-x-1/2 w-[393px] bg-white border-t border-gray-100 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#7b7b7b] text-[14px] font-medium">Итого</span>
                <span className="text-[#3c3c3c] text-[20px] font-bold tracking-[-0.5px]">
                  {total.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full h-[52px] bg-[#0051FF] text-white rounded-2xl text-[16px] font-bold tracking-[-0.4px] active:scale-[0.98] transition-transform"
              >
                Оформить заказ
              </button>
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}
