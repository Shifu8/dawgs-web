"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import OrganizerProfileOverlay from "@/frontend/features/organizer/OrganizerProfileOverlay";
import { events as fallbackEvents } from "@/frontend/services/nenezData";

export default function OrganizerSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  return (
    <OrganizerProfileOverlay
      isOpen={isOpen}
      onClose={handleClose}
      organizerName={slug}
      allEvents={fallbackEvents}
    />
  );
}
