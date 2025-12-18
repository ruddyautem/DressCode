"use client";

import { useDraftModeEnvironment } from "next-sanity/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DisableDraftMode() {
  const environment = useDraftModeEnvironment();
  const router = useRouter();
  const [isDisabling, setIsDisabling] = useState(false);

  if (environment !== "live" && environment !== "unknown") {
    return null;
  }

  const handleClick = async () => {
    if (isDisabling) return; // Prevent double-clicks
    
    setIsDisabling(true);
    
    try {
      const response = await fetch("/draft-mode/disable", {
        method: "POST", // Explicit method
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to disable draft mode");
      }
    } catch (error) {
      console.error("Error disabling draft mode:", error);
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabling}
      className='fixed bottom-4 right-4 bg-gray-50 px-4 py-2 z-50 disabled:opacity-50'
    >
      {isDisabling ? "Disabling..." : "Disable Draft Mode"}
    </button>
  );
}