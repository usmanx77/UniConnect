import { useState, useRef, useCallback } from "react";

interface UsePullToRefreshOptions {
  threshold?: number;
  onRefresh: () => Promise<void>;
}

export function usePullToRefresh({
  threshold = 80,
  onRefresh,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    
    // Only trigger if at the top of the page
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || startY.current === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    },
    [isPulling, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }

    startY.current = 0;
  }, [pullDistance, threshold, onRefresh]);

  return {
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isPulling,
    pullDistance,
    isRefreshing,
    shouldRefresh: pullDistance >= threshold,
  };
}