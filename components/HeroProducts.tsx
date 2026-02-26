import Image from "next/image";

export default function HeroProducts() {
  return (
    <section className="relative w-full h-[42vh] md:h-[50vh] min-h-[360px] flex items-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/productsbackground.jpeg"
          alt="City skyline background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Foreground Character */}
      <div className="absolute right-[30%] bottom-0 h-[120%] flex items-end">
        <Image
          src="/ProductCharacter.png"
          alt="Delivery rider"
          width={1200}
          height={1200}
          priority
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Text */}
      <div className="relative z-10 w-full max-w-6xl px-4 md:px-8">
        <div className="max-w-[60%] md:max-w-lg">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            The Tools to Boost Your Gigs
          </h1>

          <p className="mt-3 md:mt-5 text-sm sm:text-base md:text-xl text-gray-200 leading-relaxed">
            Gear and apps to help drivers maximize earnings and operate like 5-star pros.
          </p>
        </div>
      </div>

    </section>
  );
}
