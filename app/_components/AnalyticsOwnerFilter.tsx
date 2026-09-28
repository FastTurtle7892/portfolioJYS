"use client";

import { useEffect, useState } from "react";

import { Analytics } from "@vercel/analytics/next";

// "?owner=1" 파라미터로 한 번 접속하면 이 브라우저에 표시를 남기고,
// 그 뒤로는 이 브라우저에서는 분석 스크립트 자체를 아예 불러오지 않는다.
// (기본 URL은 그대로 두고, 본인 기기에서만 한 번씩 등록해두는 방식)
const OWNER_FLAG_KEY = "jys_owner_visit";

function checkAndRegisterOwner(): boolean {
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

      return true;
    }
    return localStorage.getItem(OWNER_FLAG_KEY) === "1";
  } catch {
    // localStorage를 쓸 수 없는 환경(시크릿 모드 등)은 본인이 아닌 것으로 간주
    return false;
  }
}

export default function AnalyticsOwnerFilter() {
  // null = 아직 확인 전, true = 본인, false = 방문자
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    setIsOwner(checkAndRegisterOwner());
  }, []);

  // 확인 전이거나 본인으로 확인되면, Analytics 컴포넌트 자체를 마운트하지 않는다
  // → 분석 스크립트가 아예 로드되지 않으므로 방문 기록이 전송될 여지가 없다
  if (isOwner !== false) {
    return null;
  }

  return <Analytics />;
}
