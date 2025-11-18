import * as React from "react"
import { Label, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"

export interface MenuData {
  category: string
  count: number
  fill: string
  [key: string]: string | number
}

interface MenuDistributionChartProps {
  data: MenuData[]
}

export function MenuDistributionChart({ data }: MenuDistributionChartProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)

  const activeData = data[activeIndex]

  return (
    <div className="mx-auto w-full max-w-[150px] h-[150px] [&_*]:outline-none [&_*]:focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            innerRadius={45}
            outerRadius={60}
            strokeWidth={0}
            {...{ activeIndex }}
            activeShape={(props: any) => {
              const { outerRadius = 0, ...rest } = props
              return (
                <g>
                  <Sector {...rest} outerRadius={outerRadius + 8} />
                  <Sector
                    {...rest}
                    outerRadius={outerRadius + 16}
                    innerRadius={outerRadius + 10}
                    fill={rest.fill}
                    opacity={0.3}
                  />
                </g>
              )
            }}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 8}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {activeData.count.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 12}
                        className="fill-muted-foreground text-xs"
                      >
                        {activeData.category}
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}




