import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { useTelegram } from "@/hooks/useTelegram";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface EnrichedFavorite {
  id: number;
  telegramUserId: string;
  productId: number;
  product: Product | undefined;
}

export function Favorites() {
  const [, navigate] = useLocation();
  const { userId } = useTelegram();

  const { data: items = [], isLoading } = useQuery<EnrichedFavorite[]>({
    queryKey: ["/api/favorites", userId],
    queryFn: () => fetch(`/api/favorites/${userId}`).then((r) => r.json()),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) =>
      apiRequest("DELETE", `/api/favorites/${userId}/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/favorites", userId] }),
  });

  if (isLoading) {
    return (
      <MobileShell>
        <div className="relative w-[393px] min-h-screen bg-white pb-28">
          <div className="h-[54px]" />
          <div className="grid grid-cols-2 gap-x-[5px] gap-y-5 px-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="w-[176px] h-[100px] bg-gray-100 rounded-3xl animate-pulse" />
                <div className="h-5 bg-gray-100 rounded mt-3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="relative w-[393px] min-h-screen bg-white pb-28">
        <div className="h-[54px]" />

        <div className="px-4 mb-6">
          <h1 className="text-[#3c3c3c] text-[22px] font-bold tracking-[-0.5px]">
            Избранное
          </h1>
          {items.length > 0 && (
            <p className="text-[#7b7b7b] text-[13px] mt-1 tracking-[-0.3px]">
              {items.length} {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 px-8">
            <Heart size={56} className="text-gray-200" strokeWidth={1.2} />
            <p className="text-[#3c3c3c] text-[18px] font-bold mt-4 text-center tracking-[-0.4px]">
              Нет избранных товаров
            </p>
            <p className="text-[#7b7b7b] text-[13px] mt-2 text-center">
              Добавляйте понравившиеся товары и они появятся здесь
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-[5px] gap-y-5 px-4">
            {items.map((item) => (
              <article
                key={item.id}
                data-testid={`card-favorite-${item.productId}`}
                className="w-[176px] cursor-pointer"
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                <div className="relative w-[176px] h-[100px] bg-[#f5f7ff] rounded-3xl overflow-hidden flex items-center justify-center">
                  {item.product?.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-[90px] object-contain"
                    />
                  )}
                  <button
                    className="absolute top-2 left-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMutation.mutate(item.productId);
                    }}
                  >
                    <Heart size={18} className="text-red-500 fill-red-500" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-3 px-1">
                  <p className="text-[#3c3c3c] text-[18px] font-bold tracking-[-0.5px]">
                    от {item.product?.price.toLocaleString("ru-RU")} ₽
                  </p>
                  <p className="text-[#3c3c3c] text-[11px] font-medium mt-1 tracking-[-0.4px]">
                    {item.product?.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
