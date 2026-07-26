"use client";

import { use } from "react";
import HomePage from "@/frontend/app/HomePage";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-config/defaults";

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <HomePage initialConfig={DEFAULT_HOMEPAGE_CONFIG} initialEventSlug={slug} />;
}
