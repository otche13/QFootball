import { Card, CardContent } from "@/components/ui/card";

const products = [
  {
    imageSrc: "/figmaAssets/image-12.png",
    imageClassName: "w-[127px] h-[100px] ml-[23px]",
  },
  {
    imageSrc: "/figmaAssets/image-13.png",
    imageClassName: "w-[135.66px] h-[100px] ml-[19.1px] object-cover",
  },
  {
    imageSrc: "/figmaAssets/image-14.png",
    imageClassName: "w-[131.36px] h-[100px] ml-[20.8px] object-cover",
  },
  {
    imageSrc: "/figmaAssets/image-15.png",
    imageClassName: "w-[128.34px] h-[100px] ml-[23.3px] object-cover",
  },
];

export const Box = (): JSX.Element => {
  return (
    <section className="w-full max-w-[363px] px-4 pt-48">
      <header className="mb-8">
        <h2 className="[font-family:'Gotham_Pro-Medium',Helvetica] text-base font-medium leading-4 tracking-[-0.56px] text-black">
          Подобрали для вас
        </h2>
      </header>
      <div className="grid grid-cols-2 gap-x-[5px] gap-y-5">
        {products.map((product, index) => (
          <article key={`product-${index}`} className="w-[180px]">
            <Card className="w-44 rounded-3xl border-0 bg-white shadow-none">
              <CardContent className="flex h-[100px] items-start overflow-hidden rounded-3xl p-0">
                <img
                  className={product.imageClassName}
                  alt="Image"
                  src={product.imageSrc}
                />
              </CardContent>
            </Card>
            <div className="mt-4 flex items-start justify-between px-3">
              <div className="top-[116px] [font-family:'Gotham_Pro-Bold',Helvetica] font-bold text-transparent text-2xl leading-7 tracking-[-0.56px] whitespace-nowrap">
                <span className="text-[#3c3c3c] tracking-[-0.13px]">
                  от 7990{" "}
                </span>
                <span className="text-[#3c3c3c] text-base tracking-[-0.06px]">
                  ₽
                </span>
              </div>
              <div className="mt-2 flex h-[5px] w-5 gap-[5px]">
                <div className="h-[5px] w-[5px] rounded-[2.5px] bg-[#3c3c3c]" />
                <div className="mt-[1.2px] h-[2.5px] w-[2.5px] rounded-[1.25px] bg-[#7b7b7b]" />
                <div className="mt-[1.2px] h-[2.5px] w-[2.5px] rounded-[1.25px] bg-[#7b7b7b]" />
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between px-3">
              <p className="[font-family:'Gotham_Pro-Medium',Helvetica] text-xs font-medium leading-4 tracking-[-0.56px] text-[#3c3c3c] whitespace-nowrap">
                adidas Ozweego Brown
              </p>
              <img
                className="h-5 w-5"
                alt="Image"
                src="/figmaAssets/------.svg"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
