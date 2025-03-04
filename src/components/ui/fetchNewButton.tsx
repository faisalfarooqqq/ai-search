"use client";
import { useTransition } from "react";
import { Button } from "./button";
import { refreshRankingData } from "@/lib/actions";

export default function FetchNewButton({
  id,
  provider,
}: {
  id: number;
  provider: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() => {
        startTransition(() => {
          refreshRankingData(id, provider);
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Loading..." : "Fetch New Data"}
    </Button>
  );
}
