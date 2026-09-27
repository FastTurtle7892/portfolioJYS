"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center text-center gap-3 px-4">
      <p className="text-lg md:text-xl font-semibold text-foreground/80">문제가 발생했어요</p>
      <p className="text-sm text-foreground/50">잠시 후 다시 시도해 주세요.</p>
      <button
        onClick={reset}
        className="mt-4 px-5 py-2.5 rounded-md bg-foreground/5 text-foreground/75 hover:bg-foreground/10 hover:text-foreground text-sm"
      >
        다시 시도
      </button>
    </div>
  );
}
