"use client";

import EventPage from "../../events/[slug]/page";

export default function EvPage({ params }: { params: Promise<{ slug: string }> }) {
  return <EventPage params={params} />;
}
