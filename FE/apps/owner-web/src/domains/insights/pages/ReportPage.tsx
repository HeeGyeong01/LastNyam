import { useEffect, useState, useMemo } from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@shared/src/components/Button";
import {
  MenuDistributionChart,
  type MenuData,
} from "@/components/ui/menuDistributionChart";
import {
  reportApi,
  type ReportResponse,
  type MenuStats,
} from "../apis/report.api";
import { useOwnerStore } from "@/store/useOwnerStore";

// 상수
const CHART_COLORS = [
  "#DC2626",
  "#EA580C",
  "#FB923C",
  "#FDE047",
  "#84CC16",
  "#22C55E",
  "#10B981",
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

const transformMenuDistribution = (
  menuDistribution: ReportResponse["menuDistribution"]
): MenuData[] => {
  return menuDistribution.map((item, index) => ({
    category: item.category,
    count: item.count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));
};

// 컴포넌트
interface ChangeIndicatorProps {
  changeRate: number | null;
}

function ChangeIndicator({ changeRate }: ChangeIndicatorProps) {
  if (changeRate === null) return null;

  const isPositive = changeRate >= 0;
  const Icon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const colorClass = isPositive ? "text-success" : "text-error";

  return <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${colorClass}`} />;
}

interface MetricCardProps {
  title: string;
  value: number;
  changeRate: number | null;
}

function MetricCard({ title, value, changeRate }: MetricCardProps) {
  return (
    <div className="bg-bg-0 rounded-xl border border-stroke-subtle px-5 py-4 flex flex-col gap-1 items-start justify-center flex-1 w-full">
      <div className="h4-b text-secondary">{title}</div>
      <div className="flex flex-row items-center justify-between w-full flex-shrink-0">
        <div className="h3-b text-black">{value.toLocaleString()}</div>
        {changeRate !== null && (
          <div
            className={`h5-b ${
              changeRate >= 0 ? "text-success" : "text-error"
            }`}
          >
            {formatChangeRate(changeRate)}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  unit: string;
  changeRate: number | null;
  description: string;
}

function StatsCard({
  title,
  value,
  unit,
  changeRate,
  description,
}: StatsCardProps) {
  return (
    <div className="bg-bg-0 rounded-xl border border-stroke-subtle py-1 flex flex-col gap-2.5 items-center justify-center w-full flex-shrink-0">
      <div className="px-3 py-4 flex flex-col gap-1 items-center justify-center w-full flex-shrink-0 min-h-[91.5px]">
        <div className="flex flex-col gap-2.5 items-center justify-center w-full flex-shrink-0">
          <div className="flex flex-row gap-2 items-center justify-center flex-shrink-0">
            <div className="h4-b text-secondary flex items-center justify-center">
              {title} : {value.toLocaleString()} {unit}
            </div>
            <ChangeIndicator changeRate={changeRate} />
          </div>
          {changeRate !== null && (
            <div className="h5 text-center w-full min-h-[14px] flex items-center justify-center">
              <span className="text-muted-foreground">{description} </span>
              <span className={changeRate >= 0 ? "text-success" : "text-error"}>
                {Math.ceil(Math.abs(changeRate))}%&nbsp;
              </span>
              <span className="text-muted-foreground">
                {changeRate >= 0 ? " 늘었어요!" : " 줄었어요!"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DateRangeHeaderProps {
  startDate: string;
  endDate: string;
}

function DateRangeHeader({ startDate, endDate }: DateRangeHeaderProps) {
  return (
    <div className="h3-b text-black">{formatDateRange(startDate, endDate)}</div>
  );
}

interface AIRecommendationCardProps {
  advice: string | null;
}

function AIRecommendationCard({ advice }: AIRecommendationCardProps) {
  return (
    <div className="bg-bg-0 rounded-xl border border-stroke-subtle px-5 py-4 flex flex-col gap-1 items-start justify-center w-full flex-shrink-0">
      <div className="flex flex-row gap-3 items-center justify-start flex-shrink-0">
        <div className="h4-b text-secondary">라스트냠 매장 관리 추천</div>
        <Button btnStyle="filled-gray" btnShape="rounded" size="default">
          AI
        </Button>
        <div className="flex flex-row gap-2 items-center justify-start w-6 h-6 flex-shrink-0 cursor-pointer">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-1 h-6 overflow-visible"
          ></svg>
        </div>
      </div>
      <div className="text-muted-foreground text-left p1 w-full min-h-[40px]">
        {advice || "추천 내용이 없습니다."}
      </div>
    </div>
  );
}

interface MenuChartCardProps {
  menuDistributionData: MenuData[];
}

function MenuChartCard({ menuDistributionData }: MenuChartCardProps) {
  return (
    <div className="bg-bg-0 rounded-xl border border-stroke-subtle py-4 px-2 flex flex-col gap-2.5 items-center justify-center w-[183px] flex-shrink-0">
      <div className="h4-b text-secondary">메뉴별 비중 그래프</div>
      {menuDistributionData.length > 0 ? (
        <MenuDistributionChart data={menuDistributionData} />
      ) : (
        <div className="text-muted-foreground text-sm">데이터가 없습니다</div>
      )}
    </div>
  );
}

interface MenuStatsTableProps {
  menuStats: MenuStats[];
}

function MenuStatsTable({ menuStats }: MenuStatsTableProps) {
  if (!menuStats || menuStats.length === 0) {
    return (
      <div className="bg-bg-0 rounded-xl border border-stroke-subtle px-5 py-4 flex flex-col gap-2.5 items-center justify-center w-full">
        <div className="h4-b text-secondary w-full mb-2">메뉴별 상세 통계</div>
        <div className="text-muted-foreground text-sm">
          메뉴 통계 데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-0 rounded-xl border border-stroke-subtle px-5 py-4 flex flex-col gap-4 items-start justify-start w-full flex-shrink-0">
      <div className="h4-b text-secondary w-full">메뉴별 상세 통계</div>

      <div className="w-full flex flex-col gap-3">
        {menuStats.map((menu, index) => (
          <div
            key={`${menu.name}-${index}`}
            className="w-full flex flex-col gap-3 p-4 bg-bg-0 rounded-lg border border-stroke-subtle"
          >
            {/* 메뉴명과 가격 */}
            <div className="flex flex-row items-start justify-between w-full pb-3 border-b border-stroke-subtle">
              <div className="flex flex-col gap-1">
                <div className="h4-b text-black">{menu.name}</div>
                <div className="p2 text-secondary">{menu.category}</div>
              </div>
              <div className="h4-b text-black">
                {menu.price.toLocaleString()}원
              </div>
            </div>

            {/* 통계 정보 그리드 */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="flex flex-col gap-1">
                <div className="p3 text-secondary">총 판매</div>
                <div className="h5-b text-black">
                  {menu.soldSum.toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="p3 text-secondary">총 등록</div>
                <div className="h5-b text-black">
                  {menu.registerSum.toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="p3 text-secondary">주간 판매</div>
                <div className="h5-b text-black">
                  {menu.weeklySold.toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="p3 text-secondary">주간 등록</div>
                <div className="h5-b text-black">
                  {menu.weeklyRegister.toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="p3 text-secondary">푸켓팅 조회</div>
                <div className="h5-b text-black">
                  {menu.weeklyFoocketingView.toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="p3 text-secondary">푸켓팅 입장</div>
                <div className="h5-b text-black">
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

// 메인 컴포넌트
export default function ReportPage() {
  const { ownerId, shops } = useOwnerStore();
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentShopId = shops[0]?.shopId;

  useEffect(() => {
    const fetchReport = async () => {
      if (!ownerId || !currentShopId) {
        setError("점주 ID 또는 가게 ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await reportApi.getReport(ownerId, currentShopId);
        setReportData(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "주간 리포트를 불러오는데 실패했습니다."
        );
        console.error("주간 리포트 조회 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [ownerId, currentShopId]);

  const menuDistributionData = useMemo(
    () =>
      reportData ? transformMenuDistribution(reportData.menuDistribution) : [],
    [reportData]
  );

  if (isLoading) {
    return (
      <div className="min-h-full bg-bg-2 px-[18px] pt-3 pb-6 flex items-center justify-center">
        <div className="text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-full bg-bg-2 px-[18px] pt-3 pb-6 flex items-center justify-center">
        <div className="text-error">
          {error || "데이터를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg-2 px-[18px] pt-3 pb-6 flex flex-col gap-2.5 items-start justify-start">
      <div className="flex flex-col gap-2.5 items-center justify-start w-full">
        <div className="py-3 flex flex-col gap-2.5 items-start justify-center w-full flex-shrink-0">
          <DateRangeHeader
            startDate={reportData.startDate}
            endDate={reportData.endDate}
          />

          <div className="flex flex-row gap-2.5 items-stretch justify-start w-full flex-shrink-0">
            <div className="flex flex-col gap-2.5 items-start justify-start flex-1">
              <MetricCard
                title="총 판매 개수"
                value={reportData.totalSalesCount}
                changeRate={reportData.totalSalesChangeRate}
              />
              <MetricCard
                title="푸켓팅 횟수"
                value={reportData.pocketingCount}
                changeRate={reportData.pocketingChangeRate}
              />
            </div>

            <MenuChartCard menuDistributionData={menuDistributionData} />
          </div>

          <AIRecommendationCard advice={reportData.advice} />
        </div>

        <StatsCard
          title="총 방문자수"
          value={reportData.visitorCount}
          unit="명"
          changeRate={reportData.visitorChangeRate}
          description="지난주대비 가게 방문자수가&nbsp;"
        />

        <StatsCard
          title="총 판매액"
          value={reportData.totalRevenue}
          unit="원"
          changeRate={reportData.totalRevenueChangeRate}
          description="지난주대비 라스트냠 판매액이"
        />

        {/* 메뉴별 상세 통계 테이블 - 항상 표시 */}
        <div className="w-full">
          <MenuStatsTable menuStats={reportData.menuStats || []} />
        </div>
      </div>
    </div>
  );
}
