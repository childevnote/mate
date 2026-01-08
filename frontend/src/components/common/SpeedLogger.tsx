"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function SpeedLogger() {
  useReportWebVitals((metric) => {
    // 페이지 이동 시간 (Link 클릭 -> 렌더링 완료)
    if (metric.name === "Next.js-route-change-to-render") {
      console.log(
        `[페이지 이동] ${window.location.pathname} 로딩 시간: ${metric.value.toFixed(2)}ms`
      );
    }

    // 초기 로딩 시간 (새로고침/첫 진입 -> 하이드레이션 완료)
    if (metric.name === "Next.js-hydration") {
      console.log(
        `⚡ [초기 진입] ${window.location.pathname} 하이드레이션: ${metric.value.toFixed(2)}ms`
      );
    }
  });

  return null;
}