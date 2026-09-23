import Image from "next/image";

export function ParkMapImage() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#b8d4bd]">
      <Image
        src="/van-cortlandt-park-map.png"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-fill"
        priority
      />
      <div className="absolute inset-0 bg-white/5" />
    </div>
  );
}
