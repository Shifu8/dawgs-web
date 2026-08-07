"use client";

import React from "react";
import Image from "next/image";

interface AlienIconProps {
  className?: string;
  size?: number;
}

export default function AlienIcon({ className = "w-6 h-6", size = 48 }: AlienIconProps) {
  return (
    <Image
      src="/alien_avatar.png"
      alt="Perfil Alien"
      width={size}
      height={size}
      priority
      className={`rounded-full object-cover select-none ${className}`}
    />
  );
}
