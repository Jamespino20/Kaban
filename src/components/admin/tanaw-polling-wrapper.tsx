"use client";

import { useRouter } from "next/navigation";
import { usePolling } from "@/hooks/use-polling";

export function TanawPollingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  usePolling(async () => {
    router.refresh();
  }, 30_000);

  return <>{children}</>;
}
