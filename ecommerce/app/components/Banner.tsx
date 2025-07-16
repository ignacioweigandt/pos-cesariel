import Image from "next/image"
import Link from "next/link"
import type { Banner as BannerType } from "../lib/types"

interface BannerProps {
  banner: BannerType
}

export default function Banner({ banner }: BannerProps) {
  return (
    <Link href={banner.link} className="block relative overflow-hidden rounded-lg">
      <Image
        src={banner.image || "/placeholder.svg"}
        alt={banner.title}
        width={800}
        height={400}
        className="w-full h-64 md:h-80 object-cover transition-transform hover:scale-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
          <p className="text-lg md:text-xl">{banner.subtitle}</p>
        </div>
      </div>
    </Link>
  )
}
