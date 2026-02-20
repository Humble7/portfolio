"use client";

interface BarChartData {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  height?: number;
}

export function SimpleBarChart({ data, height = 200 }: SimpleBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted text-sm"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / max) * 100;
        return (
          <div
            key={i}
            className="flex flex-col items-center flex-1 min-w-0 group"
          >
            <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1">
              {item.value}
            </span>
            <div
              className="w-full bg-accent/70 rounded-t hover:bg-accent transition-colors min-h-[2px]"
              style={{ height: `${barHeight}%` }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-[10px] text-muted mt-1.5 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
