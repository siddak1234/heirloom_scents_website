"use client";

import { useEffect } from "react";
import { MessagePage } from "@/components/layout";
import { Button } from "@/components/primitives";

export default function Error({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MessagePage
      title="Something went wrong on our side."
      body="This page didn’t load correctly. Trying again usually fixes it."
    >
      <Button onClick={reset}>Try again</Button>
    </MessagePage>
  );
}
