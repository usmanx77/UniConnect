import { lazy, Suspense, ComponentType } from 'react';

// Lazy load motion components to reduce initial bundle size
const LazyMotion = lazy(() => import('motion/react').then(module => ({ default: module.motion })));
const LazyAnimatePresence = lazy(() => import('motion/react').then(module => ({ default: module.AnimatePresence })));

interface LazyMotionProps {
  children: React.ReactNode;
  [key: string]: any;
}

// Wrapper component for lazy-loaded motion
export function MotionDiv({ children, ...props }: LazyMotionProps) {
  return (
    <Suspense fallback={<div {...props}>{children}</div>}>
      <LazyMotion.div {...props}>
        {children}
      </LazyMotion.div>
    </Suspense>
  );
}

export function MotionButton({ children, ...props }: LazyMotionProps) {
  return (
    <Suspense fallback={<button {...props}>{children}</button>}>
      <LazyMotion.button {...props}>
        {children}
      </LazyMotion.button>
    </Suspense>
  );
}

export function MotionSpan({ children, ...props }: LazyMotionProps) {
  return (
    <Suspense fallback={<span {...props}>{children}</span>}>
      <LazyMotion.span {...props}>
        {children}
      </LazyMotion.span>
    </Suspense>
  );
}

// Lazy AnimatePresence wrapper
export function LazyAnimatePresenceWrapper({ children, ...props }: LazyMotionProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LazyAnimatePresence {...props}>
        {children}
      </LazyAnimatePresence>
    </Suspense>
  );
}

// Higher-order component for lazy motion
export function withLazyMotion<P extends object>(
  Component: ComponentType<P>
): ComponentType<P & LazyMotionProps> {
  return function LazyMotionComponent(props: P & LazyMotionProps) {
    const { children, ...motionProps } = props;
    return (
      <Suspense fallback={<Component {...(props as P)}>{children}</Component>}>
        <LazyMotion.div {...motionProps}>
          <Component {...(props as P)}>{children}</Component>
        </LazyMotion.div>
      </Suspense>
    );
  };
}