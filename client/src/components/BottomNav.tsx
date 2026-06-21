import { useLocation } from "wouter";
import { Home, Grid3x3, Heart, ShoppingBag, User } from "lucide-react";

const tabs = [
  { label: "Главная", icon: Home, path: "/" },
  { label: "Каталог", icon: Grid3x3, path: "/catalog" },
  { label: "Избранное", icon: Heart, path: "/favorites" },
  { label: "Корзина", icon: ShoppingBag, path: "/cart" },
  { label: "Профиль", icon: User, path: "/profile" },
];

export function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[393px] bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around px-2 pt-2 pb-5">
        {tabs.map(({ label, icon: Icon, path }) => {
          const active = location === path;
          return (
            <button
              key={path}
              data-testid={`nav-${label.toLowerCase()}`}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 min-w-[46px]"
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.2 : 1.6}
                className={active ? "text-[#0051FF]" : "text-[#3c3c3c]"}
              />
              <span
                className={`text-[10px] leading-[14px] font-medium tracking-[-0.3px] ${
                  active ? "text-[#0051FF]" : "text-[#3c3c3c]"
                }`}
                style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
