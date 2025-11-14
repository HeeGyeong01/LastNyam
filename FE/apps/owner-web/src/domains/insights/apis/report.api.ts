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
};
