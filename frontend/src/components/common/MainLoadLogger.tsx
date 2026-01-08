"use client";

import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export default function MainLoadLogger() {
  // 현재 로딩 중인 쿼리의 개수 (0이면 로딩 끝, 1 이상이면 로딩 중)
  const activeQueries = useIsFetching();
  
  const startTime = useRef<number>(0);
  const isStarted = useRef(false);

  useEffect(() => {
    // 1. 데이터 요청이 시작됨 (쿼리가 1개 이상일 때)
    if (activeQueries > 0 && !isStarted.current) {
      isStarted.current = true;
      startTime.current = performance.now();
      // console.log("⏳ [메인] 데이터 로딩 시작...");
    }

    // 2. 모든 요청이 끝남 (쿼리가 0개가 되었고, 시작한 적이 있을 때)
    if (activeQueries === 0 && isStarted.current) {
      const duration = performance.now() - startTime.current;
      console.log(`[메인화면] 모든 요소 렌더링 완료: ${duration.toFixed(2)}ms`);
      
      // 다음 측정을 위해 리셋
      isStarted.current = false;
    }
  }, [activeQueries]);

  return null;
}