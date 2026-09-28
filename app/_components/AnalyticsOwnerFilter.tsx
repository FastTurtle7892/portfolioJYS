"use client";

import { useEffect } from "react";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

// "?owner=1" 파라미터로 한 번 접속하면 이 브라우저에 표시를 남기고,
// 그 뒤로는 이 브라우저에서의 방문은 Vercel Web Analytics 집계에서 제외한다.
// (기본 URL은 그대로 두고, 본인 기기에서만 한 번씩 등록해두는 방식)
const OWNER_FLAG_KEY = "jys_owner_visit";

export default function AnalyticsOwnerFilter() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("owner") === "1") {
        localStorage.setItem(OWNER_FLAG_KEY, "1");

        // 등록 후 주소창에 ?owner=1이 남지 않도록 정리
        params.delete("owner");
        const newSearch = params.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
        window.history.replaceState({}, "", newUrl);
      }
    } catch {
      // localStorage를 쓸 수 없는 환경(시크릿 모드 등)은 조용히 무시
    }
  }, []);

  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        try {
          if (typeof window !== "undefined" && localStorage.getItem(OWNER_FLAG_KEY) === "1") {
            return null;
          }
        } catch {
          // ignore
        }
        return event;
      }}
    />
  );
}
