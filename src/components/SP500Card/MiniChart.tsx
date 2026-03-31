import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis,
} from "recharts";

interface MiniChartProps {
  closes: number[];
  isUp:   boolean;
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?:  boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {payload[0].value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </div>
  );
}

export function MiniChart({ closes, isUp }: MiniChartProps) {
  const data = useMemo(
    () => closes.map((price, i) => ({ i, price })),
    [closes],
  );

  const color = isUp ? "#52d18c" : "#f06b6b";
  const fill  = isUp ? "rgba(82,209,140,.12)" : "rgba(240,107,107,.12)";
  const min   = Math.min(...closes) * 0.999;
  const max   = Math.max(...closes) * 1.001;

  return (
    <div className="mini-chart" aria-label="가격 추이 차트">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <YAxis domain={[min, max]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "none" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
