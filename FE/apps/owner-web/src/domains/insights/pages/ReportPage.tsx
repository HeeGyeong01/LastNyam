import React, { useEffect, useState, useMemo } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import {
  type ReportResponse,
  type MenuStats,
  type DailyStatisticsResponse,
} from '../apis/report.api';
import { mockReportData, mockDailyStatisticsData } from '../data/mockReportData';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@shared/src/components/ui/chart';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MenuDistributionChart, type MenuData } from '@/components/ui/menuDistributionChart';

const PIE_CHART_COLORS = [
  'rgb(var(--color-brand))',
  'rgb(var(--color-brand-subtle))',
  'rgb(var(--color-tertiary))',
];

const formatChangeRate = (rate: number | null): string => {
  if (rate === null) return '';
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${Math.ceil(Math.abs(rate))}%`;
};

const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startFormatted = start.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
  const endFormatted = end.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
  return `${startFormatted} ~ ${endFormatted}`;
};

const formatCurrency = (value: number): string => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}만원`;
  }
  return `${value.toLocaleString()}원`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  });
};

const transformMenuDistribution = (
  menuDistribution: ReportResponse['menuDistribution']
): MenuData[] => {
  return menuDistribution.map((item, index) => ({
    category: item.category,
    count: item.count,
    fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
  }));
};

const formatAdviceText = (text: string): React.ReactNode => {
  const sections = text.split('\n\n').filter((section) => section.trim());

  return (
    <div className="space-y-5">
      {sections.map((section, index) => {
        const trimmedSection = section.trim();
        const match = trimmedSection.match(/^(\d+\))\s*(.+?):\s*(.+)$/s);

        if (match) {
          const [, number, title, description] = match;
          let emoji = '';

          if (number.startsWith('1')) {
            emoji = '📊';
          } else if (number.startsWith('2')) {
            emoji = '📦';
          } else if (number.startsWith('3')) {
            emoji = '✅';
          }

          const descriptionText = description.trim();
          const listMatches = descriptionText.match(/\(\d+\)/g);
          const hasListPattern = /\(\d+\)/.test(descriptionText) && descriptionText.includes(',');

          if (hasListPattern && listMatches && listMatches.length > 1) {
            const items: Array<{ num: string; content: string }> = [];
            const numberPattern = /\((\d+)\)/g;
            const positions: Array<{ index: number; num: string }> = [];
            let match;

            while ((match = numberPattern.exec(descriptionText)) !== null) {
              positions.push({
                index: match.index,
                num: match[1],
              });
            }

            for (let i = 0; i < positions.length; i++) {
              const start = positions[i].index;
              const end =
                i < positions.length - 1 ? positions[i + 1].index : descriptionText.length;
              const itemText = descriptionText.substring(start, end);
              const contentMatch = itemText.match(/\(\d+\)\s*(.+?)(?:,\s*|$)/s);

              if (contentMatch) {
                let content = contentMatch[1].trim();
                content = content.replace(/,\s*$/, '').trim();
                items.push({
                  num: positions[i].num,
                  content: content,
                });
              }
            }

            if (items.length > 0) {
              const formattedItems = items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-2 mt-2">
                  <span className="text-brand text-sm font-semibold flex-shrink-0">
                    {item.num}.
                  </span>
                  <span className="text-secondary leading-relaxed flex-1">{item.content}</span>
                </div>
              ));

              return (
                <div
                  key={index}
                  className="pb-4 border-b border-stroke-subtle last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-primary text-base">{title.trim()}</h3>
                      <div className="space-y-1">{formattedItems}</div>
                    </div>
                  </div>
                </div>
              );
            }
          }

          const descriptionLines = descriptionText.split('\n').filter((line) => line.trim());
          const formattedDescription = descriptionLines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (/^\(\d+\)/.test(trimmedLine)) {
              const listMatch = trimmedLine.match(/^\((\d+)\)\s*(.+)$/);
              if (listMatch) {
                const [, num, content] = listMatch;
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mt-2">
                    <span className="text-brand text-sm font-semibold flex-shrink-0">{num}.</span>
                    <span className="text-secondary leading-relaxed flex-1">{content.trim()}</span>
                  </div>
                );
              }
            }
            return trimmedLine ? (
              <p key={lineIndex} className="text-secondary leading-relaxed mt-2">
                {trimmedLine}
              </p>
            ) : null;
          });

          return (
            <div
              key={index}
              className="pb-4 border-b border-stroke-subtle last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-primary text-base">{title.trim()}</h3>
                  <div className="space-y-1">{formattedDescription}</div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <p key={index} className="text-secondary leading-relaxed">
            {trimmedSection}
          </p>
        );
      })}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
}

function EmptyState({
  title = '데이터가 없습니다',
  message = '표시할 데이터가 없습니다.',
}: EmptyStateProps) {
  return (
    <div className="bg-bg-0 rounded-2xl px-4 py-8 mb-4 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-bg-1 flex items-center justify-center mb-3">
        <svg
          className="w-8 h-8 text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div className="text-base font-semibold text-primary mb-1">{title}</div>
      <div className="text-sm text-secondary text-center">{message}</div>
    </div>
  );
}

interface QuestionAnswerSectionProps {
  question: string;
  answer: string;
}

function QuestionAnswerSection({ question, answer }: QuestionAnswerSectionProps) {
  return (
    <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-primary mb-2">{question}</div>
      <div className="text-sm text-secondary leading-relaxed">{answer}</div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changeRate?: number | null;
}

function SummaryCard({ title, value, subtitle, changeRate }: SummaryCardProps) {
  const hasChange = changeRate !== null && changeRate !== undefined;
  const isPositive = hasChange && changeRate >= 0;

  const bgColor = hasChange
    ? isPositive
      ? 'bg-success/10 border-success/30'
      : 'bg-error/10 border-error/30'
    : 'bg-bg-0 border-stroke-subtle';
  const valueColor = hasChange ? (isPositive ? 'text-success' : 'text-error') : 'text-primary';

  return (
    <div className={`${bgColor} rounded-2xl px-4 py-4 mb-0 relative border`}>
      <div className="flex items-start justify-between mb-1">
        <div className="text-sm text-secondary">{title}</div>
        {hasChange && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-success" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-error" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
              {formatChangeRate(changeRate)}
            </span>
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold ${valueColor} mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && <div className="text-xs text-tertiary mb-1">{subtitle}</div>}
    </div>
  );
}

interface PieChartSectionProps {
  title: string;
  data: MenuData[];
  totalValue: number;
}

function PieChartSection({ title, data, totalValue }: PieChartSectionProps) {
  if (data.length === 0 || totalValue === 0) {
    return (
      <div className="bg-bg-0 rounded-2xl px-5 py-4 mb-4">
        <div className="text-base font-semibold text-primary mb-4">{title}</div>
        <EmptyState title="데이터가 없습니다" message="메뉴 분포 데이터가 없습니다." />
      </div>
    );
  }

  return (
    <div className="bg-bg-0 rounded-2xl px-4 py-6 mb-4">
      <div className="text-base font-semibold text-primary mb-4">{title}</div>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[200px] h-[200px] mb-4">
          <MenuDistributionChart data={data} />
        </div>
        <div className="w-full space-y-2">
          {data.map((item, index) => {
            const percentage = totalValue > 0 ? (item.count / totalValue) * 100 : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-secondary">{item.category}</span>
                </div>
                <div className="text-sm font-medium text-primary">
                  {percentage.toFixed(0)}% ({item.count.toLocaleString()})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface BarChartSectionProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  average?: number;
  averageLabel?: string;
}

function BarChartSection({ title, data, average, averageLabel }: BarChartSectionProps) {
  if (data.length === 0) {
    return (
      <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
        <div className="text-base font-semibold text-primary mb-4">{title}</div>
        <EmptyState title="데이터가 없습니다" message="표시할 데이터가 없습니다." />
      </div>
    );
  }

  const chartConfig = {
    value: {
      label: '값',
      color: 'rgb(var(--color-brand))',
    },
  };

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const brandColor = 'rgb(var(--color-brand))';
  const secondaryColor = 'rgb(var(--color-foreground-secondary))';

  return (
    <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-primary mb-4">{title}</div>
      {average !== undefined && averageLabel && (
        <div className="text-sm text-secondary mb-4">
          {averageLabel}: <span className="font-semibold">{average.toLocaleString()}</span>
        </div>
      )}
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart data={data} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: 10, fill: secondaryColor }}
            tickFormatter={(value) => value}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={45}
            domain={[0, maxValue * 1.1]}
            tick={{ fontSize: 9, fill: secondaryColor }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="value" fill={brandColor} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface MenuStatsListProps {
  menuStats: MenuStats[];
}

function MenuStatsList({ menuStats }: MenuStatsListProps) {
  if (menuStats.length === 0) {
    return (
      <div className="bg-bg-0 rounded-2xl px-5 py-4 mb-4">
        <div className="text-base font-semibold text-primary mb-4">메뉴별 상세 통계</div>
        <EmptyState title="메뉴 통계가 없습니다" message="표시할 메뉴 통계 데이터가 없습니다." />
      </div>
    );
  }

  return (
    <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-primary mb-4">메뉴별 상세 통계</div>
      <div className="space-y-3">
        {menuStats.map((menu, index) => (
          <div
            key={`${menu.name}-${index}`}
            className="p-4 bg-bg-1 rounded-xl border border-stroke-subtle"
          >
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-stroke-subtle">
              <div>
                <div className="text-base font-semibold text-primary">{menu.name}</div>
                <div className="text-xs text-secondary mt-1">{menu.category}</div>
              </div>
              <div className="text-base font-semibold text-primary">
                {menu.price.toLocaleString()}원
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-secondary mb-1">총 판매</div>
                <div className="text-sm font-medium text-primary">
                  {menu.soldSum.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">총 등록</div>
                <div className="text-sm font-medium text-primary">
                  {menu.registerSum.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">주간 판매</div>
                <div className="text-sm font-medium text-primary">
                  {menu.weeklySold.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">주간 등록</div>
                <div className="text-sm font-medium text-primary">
                  {menu.weeklyRegister.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">푸켓팅 조회</div>
                <div className="text-sm font-medium text-primary">
                  {menu.weeklyFoocketingView.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">푸켓팅 입장</div>
                <div className="text-sm font-medium text-primary">
                  {menu.weeklyFoocketingEntry.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CombinedDailyChartProps {
  title: string;
  data: DailyStatisticsResponse['statistics'];
}

function CombinedDailyChart({ title, data }: CombinedDailyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
        <div className="text-base font-semibold text-primary mb-4">{title}</div>
        <EmptyState title="일간 데이터가 없습니다" message="표시할 일간 통계 데이터가 없습니다." />
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    fullDate: item.date,
    판매액: item.orderRevenue,
    주문수: item.orderCount,
    푸켓팅: item.foocketingCount,
    조회수: item.viewCount,
  }));

  const brandColor = 'rgb(var(--color-brand))';
  const successColor = 'rgb(var(--color-success))';
  const brandSubtleColor = 'rgb(var(--color-brand-subtle))';
  const infoColor = 'rgb(var(--color-info))';
  const secondaryColor = 'rgb(var(--color-foreground-secondary))';
  const strokeSubtleColor = 'rgb(var(--color-stroke-subtle))';

  const chartConfig = {
    판매액: {
      label: '판매액',
      color: brandColor,
    },
    주문수: {
      label: '주문 수',
      color: successColor,
    },
    푸켓팅: {
      label: '푸켓팅',
      color: brandSubtleColor,
    },
    조회수: {
      label: '조회 수',
      color: infoColor,
    },
  };

  const maxRevenue = Math.max(...chartData.map((d) => d.판매액), 0);
  const maxOrder = Math.max(...chartData.map((d) => d.주문수), 0);
  const maxFoocketing = Math.max(...chartData.map((d) => d.푸켓팅), 0);
  const maxView = Math.max(...chartData.map((d) => d.조회수), 0);

  return (
    <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-primary mb-4">{title}</div>
      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <LineChart data={chartData} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeSubtleColor} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: 10, fill: secondaryColor }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={50}
            domain={[0, maxRevenue * 1.1]}
            tick={{ fontSize: 9, fill: brandColor }}
            tickFormatter={(value) => {
              if (value >= 10000) return `${(value / 10000).toFixed(1)}만`;
              return value.toString();
            }}
            label={{
              value: '판매액',
              angle: -90,
              position: 'insideLeft',
              style: { fill: brandColor, fontSize: 9 },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={45}
            domain={[0, Math.max(maxOrder, maxFoocketing, maxView) * 1.1]}
            tick={{ fontSize: 9, fill: secondaryColor }}
            tickFormatter={(value) => value.toString()}
            label={{
              value: '건/회',
              angle: 90,
              position: 'insideRight',
              style: { fill: secondaryColor, fontSize: 9 },
            }}
          />
          <ChartTooltip
            cursor={{ stroke: strokeSubtleColor, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-bg-0 rounded-lg border border-stroke-subtle shadow-lg p-3 min-w-[180px]">
                    <div className="text-xs text-secondary mb-2 font-medium">{data.fullDate}</div>
                    <div className="space-y-1">
                      {payload.map((entry, index) => {
                        const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
                        const value = entry.value as number;
                        let formattedValue = value.toLocaleString();

                        if (entry.dataKey === '판매액') {
                          formattedValue = formatCurrency(value);
                        } else if (entry.dataKey === '주문수') {
                          formattedValue = `${value}건`;
                        } else {
                          formattedValue = `${value}회`;
                        }

                        return (
                          <div key={index} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: config.color }}
                              />
                              <span className="text-xs text-secondary">{config.label}</span>
                            </div>
                            <span className="text-xs font-semibold text-primary">
                              {formattedValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <ChartLegend content={<ChartLegendContent />} className="-mt-2" />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="판매액"
            stroke={brandColor}
            strokeWidth={2.5}
            dot={{ fill: brandColor, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="주문수"
            stroke={successColor}
            strokeWidth={2.5}
            dot={{ fill: successColor, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="푸켓팅"
            stroke={brandSubtleColor}
            strokeWidth={2.5}
            dot={{ fill: brandSubtleColor, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="조회수"
            stroke={infoColor}
            strokeWidth={2.5}
            dot={{ fill: infoColor, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default function ReportPage() {
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [dailyData, setDailyData] = useState<DailyStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 500));
        setReportData(mockReportData);
        setDailyData(mockDailyStatisticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
        console.error('데이터 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuDistributionData = useMemo(
    () => (reportData ? transformMenuDistribution(reportData.menuDistribution) : []),
    [reportData]
  );

  const totalMenuCount = useMemo(() => {
    return menuDistributionData.reduce((sum, item) => sum + item.count, 0);
  }, [menuDistributionData]);

  const weeklyData = useMemo(() => {
    if (!reportData) return [];
    const weeks = ['11.03', '11.10', '11.17'];
    const baseValue = reportData.totalRevenue / 3;
    return weeks.map((week, index) => ({
      label: week,
      value: Math.floor(baseValue * (0.85 + index * 0.1)),
    }));
  }, [reportData]);

  const weeklyAverage = useMemo(() => {
    if (weeklyData.length === 0) return 0;
    const sum = weeklyData.reduce((acc, item) => acc + item.value, 0);
    return Math.floor(sum / weeklyData.length);
  }, [weeklyData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-1 px-4 py-6 flex items-center justify-center">
        <div className="text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-bg-1 px-4 py-6 flex items-center justify-center">
        <div className="text-error">{error || '데이터를 불러올 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-1 px-4 py-6 pb-20">
      <div className="mb-6">
        <div className="text-xl sm:text-2xl font-bold text-primary">
          {formatDateRange(reportData.startDate, reportData.endDate)}
        </div>
      </div>

      <div className="mb-4 bg-bg-0 rounded-2xl px-4 py-4">
        <h2 className="text-lg font-bold text-primary mb-3">주요 지표</h2>
        <div className="grid grid-cols-2 gap-2">
          <SummaryCard
            title="총 판매액"
            value={formatCurrency(reportData.totalRevenue)}
            changeRate={reportData.totalRevenueChangeRate}
          />
          <SummaryCard
            title="총 판매 개수"
            value={reportData.totalSalesCount}
            changeRate={reportData.totalSalesChangeRate}
          />
          <SummaryCard
            title="푸켓팅 횟수"
            value={reportData.pocketingCount}
            changeRate={reportData.pocketingChangeRate}
          />
          <SummaryCard
            title="총 방문자수"
            value={`${reportData.visitorCount}명`}
            changeRate={reportData.visitorChangeRate}
          />
        </div>
      </div>

      {reportData.advice && (
        <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-base font-semibold text-primary">라스트냠 매장 관리 추천</div>
            <span className="px-2 py-1 bg-brand/10 text-brand text-xs font-medium rounded">AI</span>
          </div>
          <div className="text-sm leading-relaxed">{formatAdviceText(reportData.advice)}</div>
        </div>
      )}

      {dailyData && dailyData.statistics && dailyData.statistics.length > 0 && (
        <>
          <div className="mb-4 mt-6">
            <h2 className="text-xl font-bold text-primary">일간 통계</h2>
            <div className="text-sm text-secondary mt-1">
              최근 7일간의 상세 통계를 한 번에 확인하세요
            </div>
          </div>

          <CombinedDailyChart title="일간 통계 추이" data={dailyData.statistics} />

          {dailyData.summary && (
            <div className="bg-bg-0 rounded-2xl px-4 py-4 mb-4">
              <div className="text-base font-semibold text-primary mb-4">일간 통계 요약</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-secondary mb-1">총 판매액</div>
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(dailyData.summary.totalOrderRevenue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary mb-1">총 주문 수</div>
                  <div className="text-lg font-semibold text-primary">
                    {dailyData.summary.totalOrderCount.toLocaleString()}건
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary mb-1">총 푸켓팅</div>
                  <div className="text-lg font-semibold text-primary">
                    {dailyData.summary.totalFoocketingCount.toLocaleString()}회
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary mb-1">총 조회 수</div>
                  <div className="text-lg font-semibold text-primary">
                    {dailyData.summary.totalViewCount.toLocaleString()}회
                  </div>
                </div>
              </div>
              {dailyData.summary.averageOrderRevenue !== null && (
                <div className="mt-4 pt-4 border-t border-stroke-subtle">
                  <div className="text-xs text-secondary mb-2">일평균</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-secondary">평균 판매액</div>
                      <div className="text-base font-semibold text-primary">
                        {formatCurrency(Math.floor(dailyData.summary.averageOrderRevenue))}
                      </div>
                    </div>
                    {dailyData.summary.averageOrderCount !== null && (
                      <div>
                        <div className="text-sm text-secondary">평균 주문 수</div>
                        <div className="text-base font-semibold text-primary">
                          {Math.floor(dailyData.summary.averageOrderCount).toLocaleString()}건
                        </div>
                      </div>
                    )}
                    {dailyData.summary.averageFoocketingCount !== null && (
                      <div>
                        <div className="text-sm text-secondary">평균 푸켓팅</div>
                        <div className="text-base font-semibold text-primary">
                          {Math.floor(dailyData.summary.averageFoocketingCount).toLocaleString()}회
                        </div>
                      </div>
                    )}
                    {dailyData.summary.averageViewCount !== null && (
                      <div>
                        <div className="text-sm text-secondary">평균 조회 수</div>
                        <div className="text-base font-semibold text-primary">
                          {Math.floor(dailyData.summary.averageViewCount).toLocaleString()}회
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <BarChartSection
        title="주간 판매액 추이"
        data={weeklyData}
        average={weeklyAverage}
        averageLabel="주간 평균"
      />

      <PieChartSection
        title="총 수입 최다 순위"
        data={menuDistributionData}
        totalValue={totalMenuCount}
      />

      <QuestionAnswerSection
        question="어떤 메뉴가 가장 많이 팔렸나요?"
        answer={`총 ${reportData.menuStats.length}개의 메뉴가 판매되었으며, 카테고리별로 분포를 확인할 수 있습니다.`}
      />

      <MenuStatsList menuStats={reportData.menuStats || []} />
    </div>
  );
}
