import React from 'react';

export const AssignmentDonutChart = ({
  data = [
    { label: 'Completed', count: 3, color: '#344499' },
    { label: 'In Progress', count: 1, color: '#FFCC33' },
    { label: 'Under Evaluation', count: 1, color: '#C88700' },
    { label: 'Not Started', count: 2, color: '#E7E7E2' }
  ]
}) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // SVG parameters
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Pure calculation of segments with stroke dash offsets
  const segments = data.reduce((acc, item) => {
    const percent = total > 0 ? item.count / total : 0;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * acc.offset;
    return {
      offset: acc.offset + percent,
      items: [
        ...acc.items,
        {
          ...item,
          strokeDasharray,
          strokeDashoffset
        }
      ]
    };
  }, { offset: 0, items: [] }).items;

  return (
    <div className="flex flex-col items-center w-full space-y-5 p-1">
      {/* SVG Donut Chart */}
      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center my-1">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F0F0EB"
            strokeWidth={strokeWidth}
          />
          {segments.map((item, idx) => {
            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={item.strokeDasharray}
                strokeDashoffset={item.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-3xl font-black text-brand-text-primary leading-none">
            {total}
          </span>
          <span className="text-[10px] uppercase font-bold text-brand-text-secondary mt-1 tracking-wider">
            Total Sprints
          </span>
        </div>
      </div>

      {/* Description / Legend Items Stacked Vertically Below Chart */}
      <div className="w-full space-y-2 pt-3 border-t border-brand-border/60">
        {data.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FBFBFA] border border-brand-border/60 hover:bg-[#F5F5F0] transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-brand-text-primary">
                  {item.label}
                </span>
              </div>
              <div className="text-right flex items-center gap-1.5 font-mono">
                <span className="font-bold text-brand-text-primary text-xs">{item.count}</span>
                <span className="text-[11px] text-brand-text-secondary font-medium font-sans">
                  ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentDonutChart;
