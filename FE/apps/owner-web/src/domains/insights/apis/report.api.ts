import { fetchWithAuthJSON, OWNER_API_BASE_URL } from "@/lib/apiClient";

// 백엔드 API 응답 타입
export interface ReportResponse {
  startDate: string;
  endDate: string;
  totalSalesCount: number;
  totalSalesChangeRate: number | null;
  totalRevenue: number;
  totalRevenueChangeRate: number | null;
  pocketingCount: number;
  pocketingChangeRate: number | null;
  visitorCount: number;
  visitorChangeRate: number | null;
  menuStats: MenuStats[];
  menuDistribution: MenuDistribution[];
  advice: string | null;
}

export interface MenuStats {
  name: string;
  category: string;
  price: number;
  soldSum: number;
  registerSum: number;
  weeklySold: number;
  weeklyRegister: number;
  weeklyFoocketingView: number;
  weeklyFoocketingEntry: number;
}

export interface MenuDistribution {
  category: string;
  count: number;
}

// 일간 통계 응답 타입
export interface DailyStatisticsResponse {
  shopId: number;
  statistics: DailyStat[];
  summary: DailySummary | null;
  correlationAnalysis: CorrelationAnalysis | null;
}

export interface DailyStat {
  date: string;
  foocketingCount: number;
  viewCount: number;
  orderCount: number;
  orderRevenue: number;
}

export interface DailySummary {
  totalFoocketingCount: number;
  totalViewCount: number;
  totalOrderCount: number;
  totalOrderRevenue: number;
  averageFoocketingCount: number | null;
  averageViewCount: number | null;
  averageOrderCount: number | null;
  averageOrderRevenue: number | null;
}

export interface CorrelationAnalysis {
  foocketingToOrder: number | null;
  viewToOrder: number | null;
  foocketingToView: number | null;
  insights: string | null;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const reportApi = {
  /**
   * 주간 리포트 조회
   * @param ownerId 점주 ID
   * @param shopId 가게 ID
   * @returns 주간 리포트 데이터
   */
  getReport: async (
    ownerId: number,
    shopId: number
  ): Promise<ReportResponse> => {
    const url = `${OWNER_API_BASE_URL.replace(
      /\/$/,
      ""
    )}/api/owner/${ownerId}/report?shopId=${shopId}`;

    const response = await fetchWithAuthJSON<ApiResponse<ReportResponse>>(url, {
      method: "GET",
    });

    if (response.status !== "SUCCESS" || !response.data) {
      throw new Error(response.message || "주간 리포트 조회에 실패했습니다.");
    }

    return response.data;
  },

  /**
   * 일간 통계 조회
   * @param ownerId 점주 ID
   * @param shopId 가게 ID
   * @param startDate 시작 날짜 (YYYY-MM-DD, 선택)
   * @param endDate 종료 날짜 (YYYY-MM-DD, 선택)
   * @returns 일간 통계 데이터
   */
  getDailyStatistics: async (
    ownerId: number,
    shopId: number,
    startDate?: string,
    endDate?: string
  ): Promise<DailyStatisticsResponse> => {
    const params = new URLSearchParams();
    params.append("shopId", shopId.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = `${OWNER_API_BASE_URL.replace(
      /\/$/,
      ""
    )}/api/owner/${ownerId}/report/daily?${params.toString()}`;

    const response = await fetchWithAuthJSON<ApiResponse<DailyStatisticsResponse>>(
      url,
      {
        method: "GET",
      }
    );

    if (response.status !== "SUCCESS" || !response.data) {
      throw new Error(
        response.message || "일간 통계 조회에 실패했습니다."
      );
    }

    return response.data;
  },
};
