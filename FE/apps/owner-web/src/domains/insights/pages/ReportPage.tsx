import { useEffect, useState, useMemo } from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import {
  reportApi,
  type ReportResponse,
  type MenuStats,
  type DailyStatisticsResponse,
} from "../apis/report.api";
import { useOwnerStore } from "@/store/useOwnerStore";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@shared/src/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { MenuDistributionChart, type MenuData } from "@/components/ui/menuDistributionChart";

const PIE_CHART_COLORS = [
  "#3B82F6", // 파란색
  "#9CA3AF", // 회색
  "#374151", // 진한 회색
];

// 유틸리티 함수
const formatChangeRate = (rate: number | null): string => {
  if (rate === null) return "";
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${Math.ceil(Math.abs(rate))}%`;
};

const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startFormatted = start.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
  const endFormatted = end.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
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
  return date.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
};

const transformMenuDistribution = (
  menuDistribution: ReportResponse["menuDistribution"]
): MenuData[] => {
  return menuDistribution.map((item, index) => ({
    category: item.category,
    count: item.count,
    fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
  }));
};

// EmptyState 컴포넌트
interface EmptyStateProps {
  title?: string;
  message?: string;
}

function EmptyState({ 
  title = "데이터가 없습니다", 
  message = "표시할 데이터가 없습니다." 
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl px-4 py-8 mb-4 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <svg
          className="w-8 h-8 text-gray-400"
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
      <div className="text-base font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-500 text-center">{message}</div>
    </div>
  );
}

// 컴포넌트
interface QuestionAnswerSectionProps {
  question: string;
  answer: string;
}

function QuestionAnswerSection({ question, answer }: QuestionAnswerSectionProps) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-gray-900 mb-2">{question}</div>
      <div className="text-sm text-gray-600 leading-relaxed">{answer}</div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 mb-4">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-400">{subtitle}</div>
      )}
    </div>
  );
}

interface ChangeIndicatorProps {
  changeRate: number | null;
  description: string;
  isPositive?: boolean;
}

function ChangeIndicator({ changeRate, description, isPositive }: ChangeIndicatorProps) {
  if (changeRate === null) return null;

  const actualIsPositive = isPositive !== undefined ? isPositive : changeRate >= 0;
  const Icon = actualIsPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const colorClass = actualIsPositive ? "text-green-600" : "text-red-600";
  const bgColor = actualIsPositive ? "bg-green-50" : "bg-red-50";

  return (
    <div className={`${bgColor} rounded-2xl px-4 py-4 mb-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <span className="text-sm text-gray-700">{description}</span>
      </div>
      <div className={`text-lg font-semibold ${colorClass}`}>
        {actualIsPositive ? "늘었어요" : "줄었어요"}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {formatChangeRate(changeRate)} 변화
      </div>
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
      <div className="bg-white rounded-2xl px-5 py-4 mb-4">
        <div className="text-base font-semibold text-gray-900 mb-4">{title}</div>
        <EmptyState 
          title="데이터가 없습니다"
          message="메뉴 분포 데이터가 없습니다."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-6 mb-4">
      <div className="text-base font-semibold text-gray-900 mb-4">{title}</div>
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
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-gray-700">{item.category}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
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
      <div className="bg-white rounded-2xl px-4 py-4 mb-4">
        <div className="text-base font-semibold text-gray-900 mb-4">{title}</div>
        <EmptyState 
          title="데이터가 없습니다"
          message="표시할 데이터가 없습니다."
        />
      </div>
    );
  }

  const chartConfig = {
    value: {
      label: "값",
      color: "#3B82F6",
    },
  };

  const maxValue = Math.max(...data.map((d) => d.value), 0);

  return (
    <div className="bg-white rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-gray-900 mb-4">{title}</div>
      {average !== undefined && averageLabel && (
        <div className="text-sm text-gray-600 mb-4">
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
            tick={{ fontSize: 10, fill: "#6B7280" }}
            tickFormatter={(value) => value}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={45}
            domain={[0, maxValue * 1.1]}
            tick={{ fontSize: 9, fill: "#6B7280" }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface ComparisonTableProps {
  title: string;
  currentValue: number;
  previousValue: number;
  currentLabel: string;
  previousLabel: string;
  formatValue?: (value: number) => string;
}

function ComparisonTable({
  title,
  currentValue,
  previousValue,
  changeRate,
  currentLabel,
  previousLabel,
  formatValue = (v) => v.toLocaleString(),
}: ComparisonTableProps & { changeRate: number | null }) {
  const diff = currentValue - previousValue;
  const isPositive = diff >= 0;

  return (
    <div className="bg-white rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-gray-900 mb-4">{title}</div>
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-sm text-gray-600">{currentLabel}</span>
          <span className="text-sm font-medium text-gray-900">
            {changeRate !== null ? `${Math.abs(changeRate).toFixed(0)}%` : "-"} - {formatValue(currentValue)}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-sm text-gray-600">{previousLabel}</span>
          <span className="text-sm font-medium text-gray-900">
            {formatValue(previousValue)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-gray-600">증감</span>
          <span className={`text-sm font-semibold ${isPositive ? "text-red-600" : "text-green-600"}`}>
            {isPositive ? "+" : ""}{formatValue(diff)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MenuStatsListProps {
  menuStats: MenuStats[];
}

function MenuStatsList({ menuStats }: MenuStatsListProps) {
  if (menuStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl px-5 py-4 mb-4">
        <div className="text-base font-semibold text-gray-900 mb-4">메뉴별 상세 통계</div>
        <EmptyState 
          title="메뉴 통계가 없습니다"
          message="표시할 메뉴 통계 데이터가 없습니다."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-gray-900 mb-4">메뉴별 상세 통계</div>
      <div className="space-y-3">
        {menuStats.map((menu, index) => (
          <div
            key={`${menu.name}-${index}`}
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
              <div>
                <div className="text-base font-semibold text-gray-900">{menu.name}</div>
                <div className="text-xs text-gray-500 mt-1">{menu.category}</div>
              </div>
              <div className="text-base font-semibold text-gray-900">
                {menu.price.toLocaleString()}원
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">총 판매</div>
                <div className="text-sm font-medium text-gray-900">
                  {menu.soldSum.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">총 등록</div>
                <div className="text-sm font-medium text-gray-900">
                  {menu.registerSum.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">주간 판매</div>
                <div className="text-sm font-medium text-gray-900">
                  {menu.weeklySold.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">주간 등록</div>
                <div className="text-sm font-medium text-gray-900">
                  {menu.weeklyRegister.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">푸켓팅 조회</div>
                <div className="text-sm font-medium text-gray-900">
                  {menu.weeklyFoocketingView.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">푸켓팅 입장</div>
                <div className="text-sm font-medium text-gray-900">
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

// 통합 일간 그래프 컴포넌트 (모든 요소를 한 번에 표시)
interface CombinedDailyChartProps {
  title: string;
  data: DailyStatisticsResponse["statistics"];
}

function CombinedDailyChart({ title, data }: CombinedDailyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl px-4 py-4 mb-4">
        <div className="text-base font-semibold text-gray-900 mb-4">{title}</div>
        <EmptyState
          title="일간 데이터가 없습니다"
          message="표시할 일간 통계 데이터가 없습니다."
        />
      </div>
    );
  }

  // 차트 데이터 변환
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    fullDate: item.date,
    판매액: item.orderRevenue,
    주문수: item.orderCount,
    푸켓팅: item.foocketingCount,
    조회수: item.viewCount,
  }));

  // 차트 설정
  const chartConfig = {
    판매액: {
      label: "판매액",
      color: "#3B82F6",
    },
    주문수: {
      label: "주문 수",
      color: "#10B981",
    },
    푸켓팅: {
      label: "푸켓팅",
      color: "#8B5CF6",
    },
    조회수: {
      label: "조회 수",
      color: "#F59E0B",
    },
  };

  // 각 요소별 최대값 계산 (각각의 스케일)
  const maxRevenue = Math.max(...chartData.map((d) => d.판매액), 0);
  const maxOrder = Math.max(...chartData.map((d) => d.주문수), 0);
  const maxFoocketing = Math.max(...chartData.map((d) => d.푸켓팅), 0);
  const maxView = Math.max(...chartData.map((d) => d.조회수), 0);

  return (
    <div className="bg-white rounded-2xl px-4 py-4 mb-4">
      <div className="text-base font-semibold text-gray-900 mb-4">{title}</div>
      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <LineChart data={chartData} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          {/* 왼쪽 Y축: 판매액 (큰 값) */}
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={50}
            domain={[0, maxRevenue * 1.1]}
            tick={{ fontSize: 9, fill: "#3B82F6" }}
            tickFormatter={(value) => {
              if (value >= 10000) return `${(value / 10000).toFixed(1)}만`;
              return value.toString();
            }}
            label={{ value: "판매액", angle: -90, position: "insideLeft", style: { fill: "#3B82F6", fontSize: 9 } }}
          />
          {/* 오른쪽 Y축: 주문수, 푸켓팅, 조회수 (작은 값) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={45}
            domain={[0, Math.max(maxOrder, maxFoocketing, maxView) * 1.1]}
            tick={{ fontSize: 9, fill: "#6B7280" }}
            tickFormatter={(value) => value.toString()}
            label={{ value: "건/회", angle: 90, position: "insideRight", style: { fill: "#6B7280", fontSize: 9 } }}
          />
          <ChartTooltip
            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3 min-w-[180px]">
                    <div className="text-xs text-gray-500 mb-2 font-medium">{data.fullDate}</div>
                    <div className="space-y-1">
                      {payload.map((entry, index) => {
                        const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
                        const value = entry.value as number;
                        let formattedValue = value.toLocaleString();
                        
                        if (entry.dataKey === "판매액") {
                          formattedValue = formatCurrency(value);
                        } else if (entry.dataKey === "주문수") {
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
                              <span className="text-xs text-gray-600">{config.label}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-900">
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
          <ChartLegend
            content={<ChartLegendContent />}
            className="-mt-2"
          />
          {/* 판매액: 왼쪽 Y축 사용 */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="판매액"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ fill: "#3B82F6", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
          {/* 주문수: 오른쪽 Y축 사용 */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="주문수"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ fill: "#10B981", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
          {/* 푸켓팅: 오른쪽 Y축 사용 */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="푸켓팅"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            dot={{ fill: "#8B5CF6", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
          {/* 조회수: 오른쪽 Y축 사용 */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="조회수"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={{ fill: "#F59E0B", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

// 메인 컴포넌트
export default function ReportPage() {
  const { ownerId, shops } = useOwnerStore();
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [dailyData, setDailyData] = useState<DailyStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentShopId = shops[0]?.shopId;

  useEffect(() => {
    const fetchData = async () => {
      if (!ownerId || !currentShopId) {
        setError("점주 ID 또는 가게 ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // 주간 리포트와 일간 통계를 병렬로 가져오기
        const [reportResponse, dailyResponse] = await Promise.allSettled([
          reportApi.getReport(ownerId, currentShopId),
          reportApi.getDailyStatistics(
            ownerId,
            currentShopId,
            undefined, // startDate - 백엔드에서 기본값(최근 7일) 사용
            undefined  // endDate - 백엔드에서 기본값(오늘) 사용
          ),
        ]);

        if (reportResponse.status === "fulfilled") {
          setReportData(reportResponse.value);
        } else {
          console.error("주간 리포트 조회 실패:", reportResponse.reason);
        }

        if (dailyResponse.status === "fulfilled") {
          setDailyData(dailyResponse.value);
        } else {
          console.error("일간 통계 조회 실패:", dailyResponse.reason);
          // 일간 통계는 실패해도 계속 진행
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "데이터를 불러오는데 실패했습니다."
        );
        console.error("데이터 조회 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ownerId, currentShopId]);

  const menuDistributionData = useMemo(
    () =>
      reportData ? transformMenuDistribution(reportData.menuDistribution) : [],
    [reportData]
  );

  const totalMenuCount = useMemo(() => {
    return menuDistributionData.reduce((sum, item) => sum + item.count, 0);
  }, [menuDistributionData]);

  // 주간 데이터 시뮬레이션 (실제로는 API에서 받아와야 함)
  const weeklyData = useMemo(() => {
    if (!reportData) return [];
    // 실제로는 API에서 주간별 데이터를 받아와야 하지만, 여기서는 예시 데이터 생성
    const weeks = ["01.19", "01.26", "02.02"];
    const baseValue = reportData.totalRevenue / 3;
    return weeks.map((week) => ({
      label: week,
      value: Math.floor(baseValue * (0.8 + Math.random() * 0.4)),
    }));
  }, [reportData]);

  const weeklyAverage = useMemo(() => {
    if (weeklyData.length === 0) return 0;
    const sum = weeklyData.reduce((acc, item) => acc + item.value, 0);
    return Math.floor(sum / weeklyData.length);
  }, [weeklyData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 flex items-center justify-center">
        <div className="text-red-600">
          {error || "데이터를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-20">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="text-xl sm:text-2xl font-bold text-gray-900">
          {formatDateRange(reportData.startDate, reportData.endDate)}
        </div>
      </div>

      {/* 주요 요약 지표 섹션 */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">주요 지표</h2>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title="총 판매액"
            value={formatCurrency(reportData.totalRevenue)}
            subtitle="이번 주"
          />
          <SummaryCard
            title="총 판매 개수"
            value={reportData.totalSalesCount}
            subtitle="이번 주"
          />
          <SummaryCard
            title="푸켓팅 횟수"
            value={reportData.pocketingCount}
            subtitle="이번 주"
          />
          <SummaryCard
            title="총 방문자수"
            value={`${reportData.visitorCount}명`}
            subtitle="이번 주"
          />
        </div>
      </div>

      {/* AI 추천 */}
      {reportData.advice && (
        <div className="bg-blue-50 rounded-2xl px-4 py-4 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-base font-semibold text-gray-900">라스트냠 매장 관리 추천</div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              AI
            </span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">{reportData.advice}</div>
        </div>
      )}

      {/* 변화율 표시 - 모두 한꺼번에 */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">지난주 대비 변화</h2>
        {reportData.totalRevenueChangeRate !== null && (
          <ChangeIndicator
            changeRate={reportData.totalRevenueChangeRate}
            description="판매액이"
            isPositive={reportData.totalRevenueChangeRate >= 0}
          />
        )}
        {reportData.totalSalesChangeRate !== null && (
          <ChangeIndicator
            changeRate={reportData.totalSalesChangeRate}
            description="판매 개수가"
            isPositive={reportData.totalSalesChangeRate >= 0}
          />
        )}
        {reportData.pocketingChangeRate !== null && (
          <ChangeIndicator
            changeRate={reportData.pocketingChangeRate}
            description="푸켓팅 횟수가"
            isPositive={reportData.pocketingChangeRate >= 0}
          />
        )}
        {reportData.visitorChangeRate !== null && (
          <ChangeIndicator
            changeRate={reportData.visitorChangeRate}
            description="방문자수가"
            isPositive={reportData.visitorChangeRate >= 0}
          />
        )}
      </div>

      {/* 비교 테이블 */}
      {reportData.totalRevenueChangeRate !== null && (
        <ComparisonTable
          title="지난주 대비 비교"
          currentValue={reportData.totalRevenue}
          previousValue={Math.floor(reportData.totalRevenue / (1 + reportData.totalRevenueChangeRate / 100))}
          changeRate={reportData.totalRevenueChangeRate}
          currentLabel="이번 주"
          previousLabel="지난 주"
          formatValue={formatCurrency}
        />
      )}

      {/* 질문-답변 섹션: 총 판매액 */}
      <QuestionAnswerSection
        question="이번 주 총 판매액은 얼마인가요?"
        answer={`${reportData.totalRevenue.toLocaleString()}원의 매출을 기록했습니다. 지난주 대비 ${reportData.totalRevenueChangeRate !== null ? formatChangeRate(reportData.totalRevenueChangeRate) : "비교 데이터 없음"} 변화가 있었습니다.`}
      />

      {/* 일간 그래프 섹션 */}
      {dailyData && dailyData.statistics && dailyData.statistics.length > 0 && (
        <>
          <div className="mb-4 mt-6">
            <h2 className="text-xl font-bold text-gray-900">일간 통계</h2>
            <div className="text-sm text-gray-500 mt-1">
              최근 7일간의 상세 통계를 한 번에 확인하세요
            </div>
          </div>

          {/* 통합 일간 그래프 (모든 요소를 한 번에 표시) */}
          <CombinedDailyChart
            title="일간 통계 추이"
            data={dailyData.statistics}
          />

          {/* 일간 통계 요약 */}
          {dailyData.summary && (
            <div className="bg-white rounded-2xl px-4 py-4 mb-4">
              <div className="text-base font-semibold text-gray-900 mb-4">일간 통계 요약</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">총 판매액</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(dailyData.summary.totalOrderRevenue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">총 주문 수</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {dailyData.summary.totalOrderCount.toLocaleString()}건
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">총 푸켓팅</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {dailyData.summary.totalFoocketingCount.toLocaleString()}회
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">총 조회 수</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {dailyData.summary.totalViewCount.toLocaleString()}회
                  </div>
                </div>
              </div>
              {dailyData.summary.averageOrderRevenue !== null && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">일평균</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">평균 판매액</div>
                      <div className="text-base font-semibold text-gray-900">
                        {formatCurrency(Math.floor(dailyData.summary.averageOrderRevenue))}
                      </div>
                    </div>
                    {dailyData.summary.averageOrderCount !== null && (
                      <div>
                        <div className="text-sm text-gray-600">평균 주문 수</div>
                        <div className="text-base font-semibold text-gray-900">
                          {Math.floor(dailyData.summary.averageOrderCount).toLocaleString()}건
                        </div>
                      </div>
                    )}
                    {dailyData.summary.averageFoocketingCount !== null && (
                      <div>
                        <div className="text-sm text-gray-600">평균 푸켓팅</div>
                        <div className="text-base font-semibold text-gray-900">
                          {Math.floor(dailyData.summary.averageFoocketingCount).toLocaleString()}회
                        </div>
                      </div>
                    )}
                    {dailyData.summary.averageViewCount !== null && (
                      <div>
                        <div className="text-sm text-gray-600">평균 조회 수</div>
                        <div className="text-base font-semibold text-gray-900">
                          {Math.floor(dailyData.summary.averageViewCount).toLocaleString()}회
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 상관성 분석 */}
          {dailyData.correlationAnalysis && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-4 py-4 mb-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-base font-semibold text-gray-900">상관성 분석</div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  분석
                </span>
              </div>
              {dailyData.correlationAnalysis.insights && (
                <div className="text-sm text-gray-700 leading-relaxed mb-4">
                  {dailyData.correlationAnalysis.insights}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {dailyData.correlationAnalysis.foocketingToOrder !== null && (
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-gray-500 mb-1">푸켓팅-주문</div>
                    <div className="text-base font-semibold text-gray-900">
                      {dailyData.correlationAnalysis.foocketingToOrder.toFixed(2)}
                    </div>
                  </div>
                )}
                {dailyData.correlationAnalysis.viewToOrder !== null && (
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-gray-500 mb-1">조회-주문</div>
                    <div className="text-base font-semibold text-gray-900">
                      {dailyData.correlationAnalysis.viewToOrder.toFixed(2)}
                    </div>
                  </div>
                )}
                {dailyData.correlationAnalysis.foocketingToView !== null && (
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-gray-500 mb-1">푸켓팅-조회</div>
                    <div className="text-base font-semibold text-gray-900">
                      {dailyData.correlationAnalysis.foocketingToView.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 주간 판매액 바 차트 */}
      <BarChartSection
        title="주간 판매액 추이"
        data={weeklyData}
        average={weeklyAverage}
        averageLabel="주간 평균"
      />

      {/* 메뉴 분포 파이 차트 */}
      <PieChartSection
        title="총 수입 최다 순위"
        data={menuDistributionData}
        totalValue={totalMenuCount}
      />

      {/* 질문-답변 섹션: 메뉴 통계 */}
      <QuestionAnswerSection
        question="어떤 메뉴가 가장 많이 팔렸나요?"
        answer={`총 ${reportData.menuStats.length}개의 메뉴가 판매되었으며, 카테고리별로 분포를 확인할 수 있습니다.`}
      />

      {/* 메뉴별 상세 통계 */}
      <MenuStatsList menuStats={reportData.menuStats || []} />
    </div>
  );
}
