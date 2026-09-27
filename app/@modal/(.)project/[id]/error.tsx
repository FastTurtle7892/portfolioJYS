"use client";

import { useEffect } from "react";

export default function ProjectModalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center text-center gap-3 py-10">
      <p className="text-lg md:text-xl font-semibold text-foreground/80">불러오지 못했어요</p>
      <p className="text-sm text-foreground/50">일시적인 서버/DB 연결 오류일 수 있어요. 잠시 후 다시 시도해 주세요.</p>
      <button
        onClick={reset}
        className="mt-4 px-5 py-2.5 rounded-md bg-foreground/5 text-foreground/75 hover:bg-foreground/10 hover:text-foreground text-sm"
      >
        다시 시도
      </button>
    </div>
  );
}
