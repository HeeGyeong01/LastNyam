import type { ReportResponse, DailyStatisticsResponse } from '../apis/report.api';

// 2025-11-10 ~ 2025-11-16 기간의 더미 데이터

// 주간 리포트 더미 데이터
export const mockReportData: ReportResponse = {
  startDate: '2025-11-10',
  endDate: '2025-11-16',
  totalSalesCount: 508, // weeklySold 합계: 45+32+22+89+52+68+138+62 = 508 (광어회(대) 22개 반영)
  totalSalesChangeRate: 15.3,
  totalRevenue: 3133500, // weeklySold * price 합계: (45*18000)+(32*16000)+(22*23000)+(89*3500)+(52*5000)+(68*4000)+(138*2000)+(62*3000) = 3133500
  totalRevenueChangeRate: 12.5,
  pocketingCount: 156, // 일간 통계의 totalFoocketingCount와 일치
  pocketingChangeRate: 8.2,
  visitorCount: 892, // 일간 통계의 totalViewCount 근사값 (1052는 조회수)
  visitorChangeRate: -3.1,
  menuStats: [
    {
      name: '연어초밥',
      category: '회/초밥',
      price: 18000,
      soldSum: 124,
      registerSum: 150,
      weeklySold: 45,
      weeklyRegister: 52,
      weeklyFoocketingView: 89,
      weeklyFoocketingEntry: 32,
    },
    {
      name: '참치초밥',
      category: '회/초밥',
      price: 16000,
      soldSum: 98,
      registerSum: 120,
      weeklySold: 32,
      weeklyRegister: 38,
      weeklyFoocketingView: 67,
      weeklyFoocketingEntry: 24,
    },
    {
      name: '광어회(대)',
      category: '회/초밥',
      price: 23000, // 할인 판매 가격
      soldSum: 56,
      registerSum: 70,
      weeklySold: 22, // AI 분석: 22개 판매
      weeklyRegister: 27, // 전환율 42% 고려 (22 / 0.42 ≈ 52명 참여, 위시리스트 +5 반영)
      weeklyFoocketingView: 275, // 조회수 +232 증가 반영 (43 + 232 = 275)
      weeklyFoocketingEntry: 52, // 전환율 42% 기준 (22 / 0.42 ≈ 52명 참여)
    },
    {
      name: '김밥',
      category: '김밥/분식',
      price: 3500,
      soldSum: 287,
      registerSum: 350,
      weeklySold: 89,
      weeklyRegister: 105,
      weeklyFoocketingView: 156,
      weeklyFoocketingEntry: 58,
    },
    {
      name: '떡볶이',
      category: '김밥/분식',
      price: 5000,
      soldSum: 145,
      registerSum: 180,
      weeklySold: 52,
      weeklyRegister: 62,
      weeklyFoocketingView: 98,
      weeklyFoocketingEntry: 42,
    },
    {
      name: '라면',
      category: '김밥/분식',
      price: 4000,
      soldSum: 203,
      registerSum: 250,
      weeklySold: 68,
      weeklyRegister: 78,
      weeklyFoocketingView: 134,
      weeklyFoocketingEntry: 51,
    },
    {
      name: '음료',
      category: '기타',
      price: 2000,
      soldSum: 412,
      registerSum: 500,
      weeklySold: 138,
      weeklyRegister: 165,
      weeklyFoocketingView: 245,
      weeklyFoocketingEntry: 98,
    },
    {
      name: '사이드메뉴',
      category: '기타',
      price: 3000,
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
      category: '회/초밥',
      count: 278,
    },
    {
      category: '김밥/분식',
      count: 635,
    },
    {
      category: '기타',
      count: 590,
    },
  ],
  advice:
    '1) 현재 판매 흐름 분석: 광어회(대)는 할인 판매로 22개가 팔려 총매출은 23000원×22개=506,000원으로 집계되었습니다. 조회수는 주간 +232로 관심은 크게 늘었고 위시리스트는 +5로 소폭 증가해 잠재 수요는 긍정적이지만, 실제 수령 전환율이 42%로 보면 참여자 대비 실구매 비율은 절반 이하라 수요보다 공급(할당) 제약이 더 큰 상태입니다.\n\n2) 메뉴별 재고(할당) 조정 제안: 이번 주 판매 22개와 전환율 42%를 고려해 다음 주 Fooketting 할당량을 과잉 방지를 위해 18개로 줄이세요(약 18% 감소). 참여 요청 추정치는 22 ÷ 0.42 ≈ 52명으로 남는 신청자는 많으니, 한 번에 많이 푼다기보다 총 18개를 2회(예: 10개 + 8개)로 나눠 배포해 남기는 폐기 리스크를 낮추세요.\n\n3) 다음주 실행 항목(우선순위): (1) Fooketting 총할당을 18개로 설정하고 세션을 오전/저녁 2회로 분할, (2) 하루 단위로 판매·전환(판매/참여) 수치를 모니터링해 첫 세션에서 완판이면 다음주 추가 감소(10% 단계)를 검토, (3) 조회수(+232)와 위시리스트(+5)를 활용해 알림·푸시를 보내 참여율을 높이되 재고 증가 없이 수요 흡수만 목표로 하세요.',
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
      orderRevenue: 165000,
    },
    {
      date: '2025-11-11',
      foocketingCount: 22,
      viewCount: 145,
      orderCount: 51,
      orderRevenue: 198000,
    },
    {
      date: '2025-11-12',
      foocketingCount: 19,
      viewCount: 132,
      orderCount: 48,
      orderRevenue: 178000,
    },
    {
      date: '2025-11-13',
      foocketingCount: 25,
      viewCount: 168,
      orderCount: 62,
      orderRevenue: 245000,
    },
    {
      date: '2025-11-14',
      foocketingCount: 28,
      viewCount: 189,
      orderCount: 68,
      orderRevenue: 265000,
    },
    {
      date: '2025-11-15',
      foocketingCount: 24,
      viewCount: 156,
      orderCount: 55,
      orderRevenue: 207000,
    },
    {
      date: '2025-11-16',
      foocketingCount: 20,
      viewCount: 138,
      orderCount: 46,
      orderRevenue: 175000,
    },
  ],
  summary: {
    totalFoocketingCount: 156, // 18+22+19+25+28+24+20 = 156
    totalViewCount: 1052, // 124+145+132+168+189+156+138 = 1052
    totalOrderCount: 372, // 42+51+48+62+68+55+46 = 372
    totalOrderRevenue: 1433000, // 165000+198000+178000+245000+265000+207000+175000 = 1433000
    averageFoocketingCount: 22.29, // 156 / 7 = 22.285...
    averageViewCount: 150.29, // 1052 / 7 = 150.285...
    averageOrderCount: 53.14, // 372 / 7 = 53.142...
    averageOrderRevenue: 204714.29, // 1433000 / 7 = 204714.285...
  },
  correlationAnalysis: {
    foocketingToOrder: 0.85,
    viewToOrder: 0.72,
    foocketingToView: 0.91,
    insights:
      '1) 현재 판매 흐름 분석: 광어회(대)는 할인 판매로 22개가 팔려 총매출은 23000원×22개=506,000원으로 집계되었습니다. 조회수는 주간 +232로 관심은 크게 늘었고 위시리스트는 +5로 소폭 증가해 잠재 수요는 긍정적이지만, 실제 수령 전환율이 42%로 보면 참여자 대비 실구매 비율은 절반 이하라 수요보다 공급(할당) 제약이 더 큰 상태입니다.\n\n2) 메뉴별 재고(할당) 조정 제안: 이번 주 판매 22개와 전환율 42%를 고려해 다음 주 Fooketting 할당량을 과잉 방지를 위해 18개로 줄이세요(약 18% 감소). 참여 요청 추정치는 22 ÷ 0.42 ≈ 52명으로 남는 신청자는 많으니, 한 번에 많이 푼다기보다 총 18개를 2회(예: 10개 + 8개)로 나눠 배포해 남기는 폐기 리스크를 낮추세요.\n\n3) 다음주 실행 항목(우선순위): (1) Fooketting 총할당을 18개로 설정하고 세션을 오전/저녁 2회로 분할, (2) 하루 단위로 판매·전환(판매/참여) 수치를 모니터링해 첫 세션에서 완판이면 다음주 추가 감소(10% 단계)를 검토, (3) 조회수(+232)와 위시리스트(+5)를 활용해 알림·푸시를 보내 참여율을 높이되 재고 증가 없이 수요 흡수만 목표로 하세요.',
  },
};
