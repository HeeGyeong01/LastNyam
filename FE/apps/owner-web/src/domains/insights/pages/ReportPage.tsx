import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline"
import { Button } from "@shared/src/components/Button"
import { MenuDistributionChart, type MenuData } from "@/components/ui/menuDistributionChart"

// TODO: API에서 받아올 데이터 타입
interface WeeklyReportData {
  dateRange: {
    startDate: string
    endDate: string
  }
  totalSales: {
    count: number
    changeRate: number // 양수면 증가, 음수면 감소
  }
  pocketingCount: {
    count: number
    changeRate: number
  }
  visitorCount: {
    count: number
    changeRate: number
  }
  totalRevenue: {
    amount: number
    changeRate: number
  }
  menuDistribution: MenuData[]
  aiRecommendation: string
}

// TODO: API 호출로 대체할 샘플 데이터
const sampleData: WeeklyReportData = {
  dateRange: {
    startDate: "2024-10-20",
    endDate: "2024-10-26",
  },
  totalSales: {
    count: 245,
    changeRate: 15,
  },
  pocketingCount: {
    count: 32,
    changeRate: 10,
  },
  visitorCount: {
    count: 1125,
    changeRate: 5.2,
  },
  totalRevenue: {
    amount: 2450000,
    changeRate: 5.2,
  },
  menuDistribution: [
    { category: "디저트", count: 36, fill: "#DC2626" },
    { category: "음료", count: 24, fill: "#EA580C" },
    { category: "시그니처", count: 18, fill: "#FB923C" },
    { category: "식사류", count: 12, fill: "#FDE047" },
  ],
  aiRecommendation:
    "금·일 완판 멋져요! 바로 푸켓팅으로 인증 올려 재방문을 유도하고, 다음 주 금·일은 생산을 +10~15%로 소폭 상향해 보...",
}

interface ChangeIndicatorProps {
  changeRate: number
}

function ChangeIndicator({ changeRate }: ChangeIndicatorProps) {
  const isPositive = changeRate >= 0
  const Icon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
  const colorClass = isPositive ? "text-success" : "text-error"

  return (
    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${colorClass}`} />
  )
}

export default function ReportPage() {
  // TODO: 실제로는 useEffect나 React Query로 API 호출
  const reportData = sampleData
  return (
    <div className="bg-bg-2 px-[18px] pt-3 pb-6 flex flex-col gap-2.5 items-start justify-center flex-1 overflow-y-auto">
      <div className="flex flex-col gap-2.5 items-center justify-start w-full">
        <div className="py-3 flex flex-col gap-2.5 items-start justify-center w-full flex-shrink-0">
          {/* Date Range Header */}
          <div className="h3-b text-black">
            {new Date(reportData.dateRange.startDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} ~ {new Date(reportData.dateRange.endDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
          </div>

          {/* Metrics Row */}
          <div className="flex flex-row gap-2.5 items-stretch justify-start w-full flex-shrink-0">
            {/* Left Column - Sales & Puketting */}
            <div className="flex flex-col gap-2.5 items-start justify-start flex-1">
              {/* Total Sales Card */}
              <div className="bg-bg-0 rounded-xl border border-stroke-subtle px-5 py-4 flex flex-col gap-1 items-start justify-center flex-1 w-full">
                <div className="h4-b text-secondary">총 판매 개수</div>
                <div className="flex flex-row items-center justify-between w-full flex-shrink-0">
                  <div className="h3-b text-black">{reportData.totalSales.count.toLocaleString()}</div>
                  <div className={`h5-b ${reportData.totalSales.changeRate >= 0 ? 'text-success' : 'text-error'}`}>
                    {reportData.totalSales.changeRate >= 0 ? '+' : ''}{reportData.totalSales.changeRate}%
                  </div>
                </div>
              </div>

              {/* Puketting Count Card */}
              <div className="bg-bg-0 rounded-xl border border-stroke-subtle px-5 py-4 flex flex-col gap-1 items-start justify-center flex-1 w-full">
                <div className="h4-b text-secondary">푸켓팅 횟수</div>
                <div className="flex flex-row items-center justify-between w-full flex-shrink-0">
                  <div className="h3-b text-black">{reportData.pocketingCount.count.toLocaleString()}</div>
                  <div className={`h5-b ${reportData.pocketingCount.changeRate >= 0 ? 'text-success' : 'text-error'}`}>
                    {reportData.pocketingCount.changeRate >= 0 ? '+' : ''}{reportData.pocketingCount.changeRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chart */}
            <div className="bg-bg-0 rounded-xl border border-stroke-subtle py-4 px-2 flex flex-col gap-2.5 items-center justify-center w-[183px] flex-shrink-0">
              <div className="h4-b text-secondary">메뉴별 비중 그래프</div>
              <MenuDistributionChart data={reportData.menuDistribution} />
            </div>
          </div>

          {/* AI Recommendation Card */}
          <div className="bg-bg-0 rounded-xl border border-stroke-subtle px-5 py-4 flex flex-col gap-1 items-start justify-center w-full flex-shrink-0">
            <div className="flex flex-row gap-3 items-center justify-start flex-shrink-0">
              <div className="h4-b text-secondary">라스트냠 매장 관리 추천</div>
              <Button btnStyle="filled-gray" btnShape="rounded" size="default">
                AI
              </Button>
              <div className="flex flex-row gap-2 items-center justify-start w-6 h-6 flex-shrink-0 cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-1 h-6 overflow-visible">
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="text-muted-foreground text-left p1 w-full min-h-[40px]">
              {reportData.aiRecommendation}
            </div>
          </div>
        </div>

        {/* Visitor Stats Card */}
        <div className="bg-bg-0 rounded-xl border border-stroke-subtle py-1 flex flex-col gap-2.5 items-center justify-center w-full flex-shrink-0">
          <div className="px-3 py-4 flex flex-col gap-1 items-center justify-center w-full flex-shrink-0 min-h-[91.5px]">
            <div className="flex flex-col gap-2.5 items-center justify-center w-full flex-shrink-0">
              <div className="flex flex-row gap-2 items-center justify-center flex-shrink-0">
                <div className="h4-b text-secondary flex items-center justify-center">
                  총 방문자수 : {reportData.visitorCount.count.toLocaleString()} 명
                </div>
                <ChangeIndicator changeRate={reportData.visitorCount.changeRate} />
              </div>
              <div className="h5 text-center w-full min-h-[14px] flex items-center justify-center">
                <span className="text-muted-foreground">지난주대비 가게 방문자수가 </span>
                <span className={reportData.visitorCount.changeRate >= 0 ? 'text-success' : 'text-error'}>
                  {Math.abs(reportData.visitorCount.changeRate)}%
                </span>
                <span className="text-muted-foreground">
                  {reportData.visitorCount.changeRate >= 0 ? ' 늘었어요!' : ' 줄었어요!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Stats Card */}
        <div className="bg-bg-0 rounded-xl border border-stroke-subtle py-1 flex flex-col gap-2.5 items-center justify-center w-full flex-shrink-0">
          <div className="px-3 py-4 flex flex-col gap-1 items-center justify-center w-full flex-shrink-0 min-h-[91.5px]">
            <div className="flex flex-col gap-2.5 items-center justify-center w-full flex-shrink-0">
              <div className="flex flex-row gap-2 items-center justify-center flex-shrink-0">
                <div className="h4-b text-secondary flex items-center justify-center">
                  총 판매액 : {reportData.totalRevenue.amount.toLocaleString()} 원
                </div>
                <ChangeIndicator changeRate={reportData.totalRevenue.changeRate} />
              </div>
              <div className="h5 text-center w-full min-h-[14px] flex items-center justify-center">
                <span className="text-muted-foreground">지난주대비 라스트냠 판매액이 </span>
                <span className={reportData.totalRevenue.changeRate >= 0 ? 'text-success' : 'text-error'}>
                  {Math.abs(reportData.totalRevenue.changeRate)}%
                </span>
                <span className="text-muted-foreground">
                  {reportData.totalRevenue.changeRate >= 0 ? ' 늘었어요!' : ' 줄었어요!'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
