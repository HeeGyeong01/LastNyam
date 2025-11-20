import type { ReportResponse, DailyStatisticsResponse } from '../apis/report.api';

// 2025-11-10 ~ 2025-11-16 기간의 더미 데이터

// 주간 리포트 더미 데이터
export const mockReportData: ReportResponse = {
  startDate: '2025-11-10',
  endDate: '2025-11-16',
  totalSalesCount: 508, // weeklySold 합계: 45+32+138+89+52+68+22+62 = 508 (생연어 아보카도 샐러드 138개 반영)
  totalSalesChangeRate: 15.3,
  totalRevenue: 4716900, // weeklySold * price 합계: (45*15500)+(32*14800)+(138*13300)+(89*4800)+(52*9800)+(68*4800)+(22*6800)+(62*4800) = 4716900
  totalRevenueChangeRate: 12.5,
  pocketingCount: 156, // 일간 통계의 totalFoocketingCount와 일치
  pocketingChangeRate: 8.2,
  visitorCount: 892, // 일간 통계의 totalViewCount 근사값 (1052는 조회수)
  visitorChangeRate: -3.1,
  menuStats: [
    {
      name: '비프 랩 디쉬',
      category: '샐러드/포케',
      price: 15500,
      soldSum: 124,
      registerSum: 150,
      weeklySold: 45,
      weeklyRegister: 52,
      weeklyFoocketingView: 89,
      weeklyFoocketingEntry: 32,
    },
    {
      name: '생연어 포케 볼',
      category: '샐러드/포케',
      price: 14800,
      soldSum: 98,
      registerSum: 120,
      weeklySold: 32,
      weeklyRegister: 38,
      weeklyFoocketingView: 67,
      weeklyFoocketingEntry: 24,
    },
    {
      name: '생연어 아보카도 샐러드',
      category: '샐러드/포케',
      price: 13300, // 할인 판매 가격
      soldSum: 412,
      registerSum: 500,
      weeklySold: 138, // AI 분석: 138개 판매 (가장 많이 팔림)
      weeklyRegister: 165, // 전환율 42% 고려 (138 / 0.42 ≈ 328명 참여, 위시리스트 +5 반영)
      weeklyFoocketingView: 475, // 조회수 +232 증가 반영 (243 + 232 = 475)
      weeklyFoocketingEntry: 328, // 전환율 42% 기준 (138 / 0.42 ≈ 328명 참여)
    },
    {
      name: '과카몰리 비스킷',
      category: '베이커리',
      price: 4800,
      soldSum: 287,
      registerSum: 350,
      weeklySold: 89,
      weeklyRegister: 105,
      weeklyFoocketingView: 156,
      weeklyFoocketingEntry: 58,
    },
    {
      name: '모짜렐라 불고기 파니니',
      category: '베이커리',
      price: 9800,
      soldSum: 145,
      registerSum: 180,
      weeklySold: 52,
      weeklyRegister: 62,
      weeklyFoocketingView: 98,
      weeklyFoocketingEntry: 42,
    },
    {
      name: '단호박 크림 수프',
      category: '기타',
      price: 4800,
      soldSum: 203,
      registerSum: 250,
      weeklySold: 68,
      weeklyRegister: 78,
      weeklyFoocketingView: 134,
      weeklyFoocketingEntry: 51,
    },
    {
      name: '케일해독주스',
      category: '기타',
      price: 6800,
      soldSum: 56,
      registerSum: 70,
      weeklySold: 22,
      weeklyRegister: 27,
      weeklyFoocketingView: 45,
      weeklyFoocketingEntry: 18,
    },
    {
      name: '감자 치즈 그라탕',
      category: '기타',
      price: 4800,
      soldSum: 178,
      registerSum: 220,
      weeklySold: 62,
      weeklyRegister: 72,
      weeklyFoocketingView: 112,
      weeklyFoocketingEntry: 45,
    },
  ],
  menuDistribution: [
    {
      category: '샐러드/포케',
      count: 215,
    },
    {
      category: '베이커리',
      count: 141,
    },
    {
      category: '기타',
      count: 152,
    },
  ],
  advice:
    '1) 현재 판매 흐름 분석: 생연어 아보카도 샐러드는 할인 판매로 138개가 팔려 총매출은 13300원×138개=1,835,400원으로 집계되었습니다. 조회수는 주간 +232로 관심은 크게 늘었고 위시리스트는 +5로 소폭 증가해 잠재 수요는 긍정적이지만, 실제 수령 전환율이 42%로 보면 참여자 대비 실구매 비율은 절반 이하라 수요보다 공급(할당) 제약이 더 큰 상태입니다.\n\n2) 메뉴별 재고(할당) 조정 제안: 이번 주 판매 138개와 전환율 42%를 고려해 다음 주 Fooketting 할당량을 과잉 방지를 위해 110개로 줄이세요(약 20% 감소). 참여 요청 추정치는 138 ÷ 0.42 ≈ 328명으로 남는 신청자는 많으니, 한 번에 많이 푼다기보다 총 110개를 2회(예: 60개 + 50개)로 나눠 배포해 남기는 폐기 리스크를 낮추세요.\n\n3) 다음주 실행 항목(우선순위): (1) Fooketting 총할당을 110개로 설정하고 세션을 오전/저녁 2회로 분할, (2) 하루 단위로 판매·전환(판매/참여) 수치를 모니터링해 첫 세션에서 완판이면 다음주 추가 감소(10% 단계)를 검토, (3) 조회수(+232)와 위시리스트(+5)를 활용해 알림·푸시를 보내 참여율을 높이되 재고 증가 없이 수요 흡수만 목표로 하세요.',
};

// 일간 통계 더미 데이터 (2025-11-10 ~ 2025-11-16)
export const mockDailyStatisticsData: DailyStatisticsResponse = {
  shopId: 1,
  statistics: [
    {
      date: '2025-11-10',
      foocketingCount: 18,
      viewCount: 124,
      orderCount: 42,
      orderRevenue: 248000,
    },
    {
      date: '2025-11-11',
      foocketingCount: 22,
      viewCount: 145,
      orderCount: 51,
      orderRevenue: 298000,
    },
    {
      date: '2025-11-12',
      foocketingCount: 19,
      viewCount: 132,
      orderCount: 48,
      orderRevenue: 268000,
    },
    {
      date: '2025-11-13',
      foocketingCount: 25,
      viewCount: 168,
      orderCount: 62,
      orderRevenue: 369000,
    },
    {
      date: '2025-11-14',
      foocketingCount: 28,
      viewCount: 189,
      orderCount: 68,
      orderRevenue: 399000,
    },
    {
      date: '2025-11-15',
      foocketingCount: 24,
      viewCount: 156,
      orderCount: 55,
      orderRevenue: 312000,
    },
    {
      date: '2025-11-16',
      foocketingCount: 20,
      viewCount: 138,
      orderCount: 46,
      orderRevenue: 263000,
    },
  ],
  summary: {
    totalFoocketingCount: 156, // 18+22+19+25+28+24+20 = 156
    totalViewCount: 1052, // 124+145+132+168+189+156+138 = 1052
    totalOrderCount: 372, // 42+51+48+62+68+55+46 = 372
    totalOrderRevenue: 2157000, // 248000+298000+268000+369000+399000+312000+263000 = 2157000
    averageFoocketingCount: 22.29, // 156 / 7 = 22.285...
    averageViewCount: 150.29, // 1052 / 7 = 150.285...
    averageOrderCount: 53.14, // 372 / 7 = 53.142...
    averageOrderRevenue: 308142.86, // 2157000 / 7 = 308142.857...
  },
  correlationAnalysis: {
    foocketingToOrder: 0.85,
    viewToOrder: 0.72,
    foocketingToView: 0.91,
    insights:
      '1) 현재 판매 흐름 분석: 생연어 아보카도 샐러드는 할인 판매로 138개가 팔려 총매출은 13300원×138개=1,835,400원으로 집계되었습니다. 조회수는 주간 +232로 관심은 크게 늘었고 위시리스트는 +5로 소폭 증가해 잠재 수요는 긍정적이지만, 실제 수령 전환율이 42%로 보면 참여자 대비 실구매 비율은 절반 이하라 수요보다 공급(할당) 제약이 더 큰 상태입니다.\n\n2) 메뉴별 재고(할당) 조정 제안: 이번 주 판매 138개와 전환율 42%를 고려해 다음 주 Fooketting 할당량을 과잉 방지를 위해 110개로 줄이세요(약 20% 감소). 참여 요청 추정치는 138 ÷ 0.42 ≈ 328명으로 남는 신청자는 많으니, 한 번에 많이 푼다기보다 총 110개를 2회(예: 60개 + 50개)로 나눠 배포해 남기는 폐기 리스크를 낮추세요.\n\n3) 다음주 실행 항목(우선순위): (1) Fooketting 총할당을 110개로 설정하고 세션을 오전/저녁 2회로 분할, (2) 하루 단위로 판매·전환(판매/참여) 수치를 모니터링해 첫 세션에서 완판이면 다음주 추가 감소(10% 단계)를 검토, (3) 조회수(+232)와 위시리스트(+5)를 활용해 알림·푸시를 보내 참여율을 높이되 재고 증가 없이 수요 흡수만 목표로 하세요.',
  },
};
