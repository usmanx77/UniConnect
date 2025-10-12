import { lazy, Suspense } from 'react';

// Lazy load recharts to reduce initial bundle size
const LazyResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const LazyLine = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);
const LazyXAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const LazyYAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);
const LazyCartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);
const LazyTooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);
const LazyLegend = lazy(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);
const LazyBarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);
const LazyBar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);
const LazyPieChart = lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);
const LazyPie = lazy(() => 
  import('recharts').then(module => ({ default: module.Pie }))
);
const LazyCell = lazy(() => 
  import('recharts').then(module => ({ default: module.Cell }))
);

// Lazy chart components with fallbacks
export function LazyResponsiveContainerWrapper({ children, ...props }: any) {
  return (
    <Suspense fallback={<div className="w-full h-64 bg-muted animate-pulse rounded" />}>
      <LazyResponsiveContainer {...props}>
        {children}
      </LazyResponsiveContainer>
    </Suspense>
  );
}

export function LazyLineChartWrapper({ children, ...props }: any) {
  return (
    <Suspense fallback={<div className="w-full h-64 bg-muted animate-pulse rounded" />}>
      <LazyLineChart {...props}>
        {children}
      </LazyLineChart>
    </Suspense>
  );
}

export function LazyBarChartWrapper({ children, ...props }: any) {
  return (
    <Suspense fallback={<div className="w-full h-64 bg-muted animate-pulse rounded" />}>
      <LazyBarChart {...props}>
        {children}
      </LazyBarChart>
    </Suspense>
  );
}

export function LazyPieChartWrapper({ children, ...props }: any) {
  return (
    <Suspense fallback={<div className="w-full h-64 bg-muted animate-pulse rounded" />}>
      <LazyPieChart {...props}>
        {children}
      </LazyPieChart>
    </Suspense>
  );
}

// Export all lazy components
export {
  LazyLine,
  LazyXAxis,
  LazyYAxis,
  LazyCartesianGrid,
  LazyTooltip,
  LazyLegend,
  LazyBar,
  LazyPie,
  LazyCell,
};