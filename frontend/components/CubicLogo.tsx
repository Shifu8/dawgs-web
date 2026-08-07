"use client";

import Image from "next/image";

type CubicLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function CubicLogo({ size = "md", className = "" }: CubicLogoProps) {
  const dimensions = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden bg-black ${dimensions} ${className}`}>
      <Image
        src="/images/cubic-official-logo.png"
        alt="Cubic Logo"
        width={120}
        height={120}
        className="object-contain w-full h-full"
      />
    </div>
  );
}
