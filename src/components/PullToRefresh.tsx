import { motion } from "motion/react";
import { Loader2, RefreshCw } from "lucide-react";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const {
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pullDistance,
    isRefreshing,
    shouldRefresh,
  } = usePullToRefresh({ onRefresh });

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="overflow-auto h-full"
      style={{
        overscrollBehavior: "contain",
      }}
    >
      {/* Pull indicator */}
      <motion.div
        animate={{
          height: isRefreshing ? 60 : pullDistance > 0 ? pullDistance : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex flex-col items-center gap-2">
          {isRefreshing ? (
            <>
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Refreshing...</p>
            </>
          ) : (
            <motion.div
              animate={{
                rotate: shouldRefresh ? 180 : 0,
                scale: pullDistance > 0 ? 1 : 0,
              }}
            >
              <RefreshCw className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {children}
    </div>
  );
}