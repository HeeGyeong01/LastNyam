<div align="center">

![header](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=5&height=250&section=header&text=LastNyam&fontSize=80&fontAlignY=35&desc=신선식품%20마감할인%20및%20이벤트성%20선착순%20무료배포%20플랫폼&descSize=20&descAlignY=60&animation=fadeIn)

**마감 임박 음식을 타임세일로 판매하는 선착순 티켓팅 플랫폼**

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [서비스 화면](#️-서비스-화면)
- [기술 스택](#️-기술-스택)
- [시스템 아키텍처](#%EF%B8%8F-시스템-아키텍처)

---

## 🎯 프로젝트 소개

### 💡 기획 배경

> "매일 수많은 신선식품이 유통기한 임박으로 폐기되고 있습니다."

**LastNyam**은 마감 임박 신선식품을 할인된 가격에 판매하여 **음식물 쓰레기를 줄이고**, 소비자는 **저렴하게**, 사장님은 **재고 손실을 최소화**할 수 있는 Win-Win 플랫폼입니다.

### 🎯 핵심 가치

<table>
<tr >
  <td></td>
<td align="center" width="25%">
🌱<br/>
<b>환경 보호</b>
</td>
<td  align="center" width="25%">
💰<br/>
<b>경제적<br/> 이점</b>
</td>
<td  align="center" width="25%">
🏪<br/>
<b>재고 관련</b>
</td>
<td  align="center" width="25%">
🎯<br/>
<b>푸켓팅</b>
</td>
</tr>
<tr>
  <th>
    고객
  </th>
  <td rowspan=2>
    버려질 음식물을 소비
  </td>
  <td>
    저렴한 가격에 음식 구매
  </td>
  <td>
    남아있는 재고를 한눈에 확인 가능
  </td>
  <td>
    선착순으로 무료 식사 기회
  </td>
</tr>
<tr>
  <th>
    점주
  </th>
  <td>
    재고관리 실패 리스크 헷징
  </td>
  <td>
    AI기반 판매 통계 분석 및 재고관리 코칭 제공
  </td>
  <td>
    바이럴 및 홍보 기회
  </td>
</tr>
</table>


### 📅 개발 기간

**2025.10.06 ~ 2025.11.20** (7주)

### 🏆 주요 성과

- ⚡ **선착순 이벤트** 초당 1,000+, 총 60만건 요청 처리
- 🚀 **지리 검색 성능** 95% 개선 (2초 → 0.1초)
- 📈 **시스템 가용성** 99.9% 달성 및 고 부하 시 300ms대 응답시간 유지

---

## ✨ 주요 기능

### 👥 고객 서비스

<details>
<summary><b>🗺️ 위치 기반 매장 검색</b></summary>

- 현재 위치 또는 원하는 지역의 할인중인 음식, 오픈 예정 이벤트 실시간 조회
- 반경 내 매장 필터링 및 정렬 (거리순, 할인율순, 평점순, 찜하기순, 원가순)
- Google Map기반 시각화로 직관적인 매장 탐색
- PostGIS 기반 고성능 지리 쿼리

</details>

<details>
<summary><b>🛒 마감 세일 상품 구매</b></summary>

- 마감 임박 신선식품 할인 상품 구매
- 실시간 재고 확인
- 장바구니 기능 및 카카오페이를 통한 간편 결제
- QR 코드 기반 현장 거래 확인 및 재고 관리 자동화

</details>

<details>
<summary><b>⚡ 푸켓팅 (선착순 구매 이벤트) - 핵심 기능</b></summary>

#### 특징
- **실시간 경쟁 구매**: 무료로 선착순 한정 수량 제공
- **공정한 순서 보장**: Redis 
- **카운트다운**: 이벤트 시작 전 실시간 대기 화면
- **실시간 동시 조회자 수**: Redis Zset 기반 현재 조회자 수 업데이트
- **중복 참여 방지**: 집계 서버에서 푸켓팅 참여 기록 확인

#### 동작 과정
1. 이벤트 시작 전: 대기 화면 + 카운트다운
2. 이벤트 시작: 구매 버튼 활성화
3. 구매 요청: Kafka Publisher가 구매 요청 메시지 발행 (순서 보장)
4. 순차 처리: Kafka Consumer가 순서대로 처리
5. 결과 알림: Exponential Long-Polling 기반 결과 조회

</details>

<details>
<summary><b>📱 마이페이지 & 알림</b></summary>

- 구매 내역 조회 및 상세 정보
- 찜한 매장 관리

</details>

### 🏪 사장님 서비스

<details>
<summary><b>📦 상품 관리</b></summary>

- 할인 상품 등록 (이미지, 가격, 할인율, 재고)
- 실시간 재고 관리 및 자동 품절 처리
- 상품별 판매 통계 및 분석
- AI 기반 재고관리 코칭 제공
- 가게, 메뉴 카테고리 및 태그 관리

</details>

<details>
<summary><b>🎪 푸켓팅 이벤트 생성 및 관리</b></summary>

- 이벤트 상세 설정 (시간, 수량, 할인율)
- 이벤트 종료 후 조회 수, 구매 전환률 등 상세 결과 분석

</details>

<details>
<summary><b>📊 판매 대시보드</b></summary>

- 일/주/월별 매출 통계 및 차트
- 상품 판매 비중 분석
- 매장 평점 확인
- AI 기반 재고관리 조언 및 코칭 제공

</details>

---

## 🖥️ 서비스 화면

### 고객 화면

**메인 화면**

<img src="https://github.com/user-attachments/assets/1a5ce1a4-c861-40df-a114-4b1c25bf66de" width="33%">

- 카테고리 선택 기능
- 오늘 예정된 푸켓팅 노출
- 이전 구매 기록 기반 추천

**검색 화면**

<img src="https://github.com/user-attachments/assets/97440d9e-27de-4a40-8aaf-09b809f8fabc" width="33%">

- 현재 판매중인 메뉴를 키워드 검색 가능

**지도 화면**

<img src="https://github.com/user-attachments/assets/073e6f98-87a9-4ae8-bff1-cc8f986aab48" width="33%">
<img src="https://github.com/user-attachments/assets/0747f223-0a35-40fd-86f9-f6000cc5b47e" width="33%">


- 근처의 진행중 / 예정된 푸켓팅 지도에 노출
- 지도 이동 시 반경 1km 이내 푸켓팅 검색

**푸켓팅 상세 화면**

<img src="https://github.com/user-attachments/assets/5318b508-4651-4ba4-9d88-b0c8fb4ba9bb" width="33%">

- 가게 위치 / 예정 시간 / 성공 기준 노출
- 메뉴 사진 및 상세 정보 노출

**푸켓팅 결과 화면**

<img src="https://github.com/user-attachments/assets/ee49ba20-1db5-4b9f-a515-8d28d8782e7d" width="33%">
<img src="https://github.com/user-attachments/assets/26b4189c-04af-4af1-aca9-f716f092b81a" width="33%">

- 성공 시 가게 위치 노출
- 실패 시 동일 가게의 다른 푸켓팅 및 추천 푸켓팅 노출

**가게 화면**

<img src="https://github.com/user-attachments/assets/763ad827-21e9-40b1-ad57-69db5c79224f" width="33%">

- 가게 평점/찜하기 수 등등 평판 정보 노출
- 가게 위치/거리 등 사용자와 상대적인 정보 노출
- 픽업 마감 시간 및 수령 방식 안내
- 가게에서 진행중인 마감 할인 및 푸켓팅 목록 노출

**푸켓팅 참여 기록**

<img src="https://github.com/user-attachments/assets/5784e7d1-300d-4c60-ae5b-757496786306" width="33%">
<img src="https://github.com/user-attachments/assets/8173b932-6c18-409c-b7eb-f644cba5de84" width="33%">

- 푸켓팅 성공 시 구매 내역 및 QR 확인 버튼 노출
- 해당 QR을 사장님께 제시하여 대면 거래시 구매자 확인 가능

**장바구니 화면**

<img src="https://github.com/user-attachments/assets/a71770a2-d504-4f70-a7e3-5eecf26141ca" width="33%">

- 장바구니에 물건을 담고 구매 가능
  - 단일 가게의 물건만 담기 가능
- 카카오페이를 통해 결제

### 사장님 화면

**온보딩**

<img src="https://github.com/user-attachments/assets/6ae38949-106c-4e49-b17a-ffc1a96f4469" width="33%">
<img src="https://github.com/user-attachments/assets/435c68e8-8d1c-4b47-b9ca-6d98301e46d7" width="33%">
<br>
<img src="https://github.com/user-attachments/assets/0fb9d32c-4b26-44ed-8e70-f1ca08fd04bd" width="33%">
<img src="https://github.com/user-attachments/assets/63603e5a-65da-4251-a847-336c5596d867" width="33%">

- 사장 회원으로 가입 시 1개의 가게를 필수로 입력해야 함
- Clova API를 활용한 자동 입력/수동 입력 가능

**구매 현황 화면**

<img src="https://github.com/user-attachments/assets/b71b9b2c-62e4-43ad-97d5-b5c354a94d3a" width="33%">

- 현재 구매 요청이 들어온/준비중인/수령 대기중인 주문 확인 가능
- 점주가 직접 확인하고 상태를 변경함
- QR 찍기 버튼을 통해 구매자가 소지한 QR을 확인 및 최종 수령 확인

**마감세일/푸켓팅 관리**

<img src="https://github.com/user-attachments/assets/4581e52e-bcc3-46a1-8f04-41a88ce6447f" width="33%">
<img src="https://github.com/user-attachments/assets/4c70b045-0ee5-41f2-a63f-d8489168eb8b" width="33%">
<br>
<img src="https://github.com/user-attachments/assets/4fe90bf5-3ae7-43d5-955b-0b1e9d2d9834" width="33%">
<img src="https://github.com/user-attachments/assets/59df13a5-6336-42df-930a-db7872cd9adf" width="33%">
<br>
<img src="https://github.com/user-attachments/assets/0f302bd7-6413-44d5-9bb3-e760ee10af21" width="33%">

- 가게에 등록된 메뉴를 이용해 푸켓팅/마감세일 등록 가능

**주간 레포트**

<img src="https://github.com/user-attachments/assets/75843ab3-a83c-4f73-b1be-1fcd3616050e" width="33%">
<img src="https://github.com/user-attachments/assets/f3b4371c-0b70-4990-ba5f-2a48c9f00b00" width="33%">
<br/>
<img src="https://github.com/user-attachments/assets/41df3b15-f886-4fed-b560-04ee85ffe534" width="33%">
<img src="https://github.com/user-attachments/assets/1f848662-d9ca-4268-b6fe-c2af86635fee" width="33%">

- 주요 지표 요약하여 직관적 표시
- 판매량 통계 기반 AI 조언 생성
- 일간 상세 통계 그래프 및 요약 제공
- 메뉴별 상세 통계 제공

---

## 🛠️ 기술 스택

### Backend

![Java](https://img.shields.io/badge/Java_21-007396?style=for-the-badge&logo=OpenJDK&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.5.7-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-59666C?style=for-the-badge&logo=hibernate&logoColor=white)

### Database & Cache

![PostgreSQL](https://img.shields.io/badge/PostgreSQL_17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### Message Queue & Event

![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)

### Infrastructure

![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![KEDA](https://img.shields.io/badge/KEDA-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white)
![Helm](https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white)

### CI/CD

![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)

### Monitoring & Observability

![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)


### Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/zustand-602c3c?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAA8FBMVEVHcExXQzpKQDlFV16lpqyGh4tPPTdWT0weHRU7LRZGQzmxYjlaTkZsbmywVyxtXDSFhISXm6WWpcaytb6bm56gprY0LiiXmp2prLamsMa0XS42MSxkTUVDSkuyYzGihXdDV2GprbmedVxaRD1kTUWUdGFGOCN4a2OfpbI0SFFAMSddTkbCc0dWQiGFRypXQyJUQCBcTTWviDVXQyJcUDjlqCWxjkG+hBTiohtURD6lr8lORTtDVVZmPyxwSipaRSJDOzaWpsyYqMyYqM2dq8tPOjBERTs6QUKTcCeKaCJvViZdSDK4iSngoiDvqx7KkRuGEi1hAAAAOXRSTlMApZ78cB8hCAMQO/j/FOH4KlT1wFfJTjaY6SxtVexFn3Tn2sN6d671mVuJ+/PPN9CT6TfpS4C9jJaVLRihAAAAi0lEQVQIHXXBxRKCUAAF0Es/QMDubsVuGrv1///GBQ4bx3PwgwC8gFCRohs8QrQV0ZtKOZ9JcgBmU8MwqFa9kjNTUWB58f2jPOjU9juTBTbPq+vIar972MZjwPr1uDvqCFw2wQpQVm/t7Oo9gAgAFtrtZNtMFQFp7nkWU5IQECfjYbuQFvBFRJHgjw9L0A80UmaGpAAAAABJRU5ErkJggg==)

---

## 🏗️ 시스템 아키텍처

### 전체 아키텍처

<img width="15239" height="8984" alt="Image" src="https://github.com/user-attachments/assets/56cc28fc-b420-4f1c-b4ad-11b82bf5b3be" />

### ArgoCD

<img width="2560" height="1389" alt="Image" src="https://github.com/user-attachments/assets/f1178a5f-06e1-499c-b02c-b151018c5971" />


---
## 🛠️ 성능 최적화 결과
<img src="https://github.com/user-attachments/assets/7b7286d4-9dc5-4701-afe8-b9062cbec991">

