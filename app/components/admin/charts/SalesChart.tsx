"use client"
import { DailySalesData } from '@/app/services/dashboard-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



interface SalesChartProps {
  data: DailySalesData[]; 
}

export function SalesChart({ data }: SalesChartProps) {
    return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-medium mb-4 text-gray-700">Vendas / dia</h2>
      
      <ResponsiveContainer width="100%" height="100%"> {/*Se adapta a div pai */}
        
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 35 }}>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
          {/*Eixo X (Horizontal) - dataKey="dia" diz qual campo do objeto usar*/}
          <XAxis 
            dataKey="date"   
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            dy={10} // Deslocamento para baixo
          />
          
          {/*Eixo Y (Vertical) - sem dataKey, ele calcula automático baseado no valor*/}
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            // Formata o valor (ex: 1000 vira '1k')
            tickFormatter={(value) => `R$ ${value}`} 
            width={80}
          />
          
          {/*Tooltip que aparece ao passar o mouse */}
          <Tooltip />
          
          {/*A linha em si. dataKey="vendas" é o valor numérico a ser plotado*/}
          <Line 
            type="monotone" // Deixa a linha curva/suave
            dataKey="total" 
            stroke="#2563eb" // Cor da linha (blue-600)
            strokeWidth={2} 
            dot={false} // Remove as bolinhas de cada ponto (limpa o visual)
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}