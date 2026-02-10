"use client";

import { OrderStatusData } from "@/app/services/dashboard-service";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";


interface OrderStatusChartProps {
  data: OrderStatusData[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const totalPedidos = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 shadow-sm flex flex-col">
      
      <h2 className="text-lg font-medium mb-4 text-gray-700 text-center shrink-0">
        Status dos pedidos:
      </h2>

      <div className="flex-1 relative min-h-0">
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  strokeWidth={0} 
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-gray-800 leading-none">
              {totalPedidos}
            </span>
            <span className="text-xs text-gray-400 font-medium uppercase mt-1">
              Total
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}