import { MobileShell } from "@/components/MobileShell";

export function Profile() {
  return (
    <MobileShell>
      <div className="relative w-[393px] min-h-screen bg-white pb-28">
        <div className="h-[54px]" />

        <div className="px-4 pt-2">
          <h1
            className="text-[#3c3c3c] text-[22px] font-bold tracking-[-0.5px] mb-8"
            style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
          >
            Профиль
          </h1>

          <div className="flex flex-col items-center justify-center mt-16 px-4 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                background: "linear-gradient(135deg, #0051FF 0%, #2780FF 100%)",
              }}
            >
              <span className="text-white text-[36px]">⚽</span>
            </div>

            <p
              className="text-[#3c3c3c] text-[18px] font-bold tracking-[-0.4px] mb-3"
              style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
            >
              Раздел профиля скоро появится. Следите за обновлениями!
            </p>

            <div
              className="w-full mt-8 rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, #0051FF 0%, #2780FF 100%)",
              }}
            >
              <p
                className="text-white text-[20px] font-bold tracking-[-0.4px] mb-1"
                style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
              >
                Quality Football
              </p>
              <p
                className="text-white/80 text-[13px] leading-5"
                style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
              >
                Профессиональный магазин футбольных бутс. Только оригинальная продукция.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
