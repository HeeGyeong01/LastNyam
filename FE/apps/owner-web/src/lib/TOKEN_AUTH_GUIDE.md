# 🔐 토큰 인증 시스템 가이드

## 📋 구현된 기능

### 1. **자동 토큰 재발급 (`apiClient.ts`)**
- 401 에러 발생 시 자동으로 `/api/owner/auth/refresh` 호출
- 토큰 재발급 성공 시 원래 요청 자동 재시도
- 여러 요청이 동시에 401을 받아도 한 번만 refresh 호출 (중복 방지)

### 2. **앱 시작 시 토큰 검증 (`App.tsx`)**
- 앱 로드 시 localStorage에 저장된 토큰이 실제로 유효한지 서버에 확인
- 토큰 만료 시 자동으로 refresh 시도
- Refresh도 실패하면 자동 로그아웃 및 로그인 페이지 리다이렉트

### 3. **Zustand 스토어에 검증 시간 추적**
- `lastTokenValidation`: 마지막으로 토큰이 검증된 시간
- 향후 주기적인 토큰 검증에 활용 가능

## 🔄 작동 흐름

### **시나리오 1: 앱 처음 로드 (토큰 유효)**

```
1. 사용자가 브라우저 열기
   ↓
2. zustand가 localStorage에서 토큰 복원
   { isAuthenticated: true, accessToken: "..." }
   ↓
3. App.tsx의 useEffect 실행
   ↓
4. authApi.getProfile(accessToken) 호출
   ↓
5. ✅ 200 OK → 토큰 유효함
   ↓
6. setLastTokenValidation(Date.now()) 저장
   ↓
7. 정상적으로 앱 렌더링
```

### **시나리오 2: 앱 로드 시 토큰 만료 (Refresh 성공)**

```
1. 사용자가 며칠 후 브라우저 다시 열기
   ↓
2. zustand가 localStorage에서 복원
   { isAuthenticated: true, accessToken: "만료된토큰" }
   ↓
3. App.tsx의 useEffect 실행
   ↓
4. authApi.getProfile(accessToken) 호출
   ↓
5. ❌ 401 Unauthorized → 토큰 만료
   ↓
6. 🔄 authApi.refresh() 자동 호출
   (쿠키의 refreshToken 자동 전송)
   ↓
7. ✅ 새 accessToken 발급 성공
   ↓
8. updateTokens(newAccessToken) → zustand 업데이트
   ↓
9. setLastTokenValidation(Date.now())
   ↓
10. 정상적으로 앱 렌더링
    (사용자는 토큰이 만료된 줄도 모름!)
```

### **시나리오 3: Refresh 토큰도 만료 (자동 로그아웃)**

```
1. 사용자가 한 달 후 브라우저 다시 열기
   ↓
2. authApi.getProfile(accessToken) → 401 에러
   ↓
3. authApi.refresh() 시도
   ↓
4. ❌ Refresh 토큰도 만료됨
   ↓
5. logout() 자동 호출
   - localStorage 모든 인증 정보 삭제
   - isAuthenticated = false
   ↓
6. PrivateRoute에서 감지
   ↓
7. 로그인 페이지로 자동 리다이렉트
```

### **시나리오 4: API 호출 중 토큰 만료 (fetchWithAuth)**

```
1. 사용자가 메뉴 목록 조회 버튼 클릭
   ↓
2. fetchWithAuth('/api/owner/.../menu')
   Authorization: Bearer (만료된토큰)
   ↓
3. ❌ 401 Unauthorized
   ↓
4. fetchWithAuth가 자동으로 감지
   ↓
5. 🔄 refreshAccessToken() 내부 호출
   ↓
6. ✅ 새 토큰 발급 성공
   ↓
7. zustand에 새 토큰 저장
   ↓
8. 🔁 원래 메뉴 목록 요청을 새 토큰으로 재시도
   ↓
9. ✅ 메뉴 데이터 정상 반환
   (사용자는 아무것도 모름!)
```

## 📝 코드 예시

### **기존 코드 (개선 전)**

```typescript
// 문제점:
// 1. accessToken을 매번 파라미터로 전달해야 함
// 2. 401 에러 시 수동으로 처리해야 함
// 3. 토큰 만료 시 사용자가 직접 로그아웃해야 함

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

if (response.status === 401) {
  // 수동으로 재발급 로직 작성...
}
```

### **새로운 코드 (개선 후)**

```typescript
// 장점:
// 1. accessToken 파라미터 불필요 (자동으로 추가됨)
// 2. 401 에러 시 자동 재발급 및 재시도
// 3. 코드가 훨씬 간결해짐

import { fetchWithAuth } from '@/lib/apiClient';

const response = await fetchWithAuth(url, {
  method: 'GET',
});

// 끝! 토큰 관리는 알아서 처리됨
```

## 🎯 주요 파일

### **1. `lib/apiClient.ts`**
- `fetchWithAuth()`: 인증이 필요한 fetch 래퍼
- `fetchWithAuthJSON()`: JSON 응답 자동 파싱
- `refreshAccessToken()`: 토큰 재발급 로직

### **2. `App.tsx`**
- 앱 시작 시 토큰 유효성 검증
- 만료 시 자동 refresh 시도
- 로딩 UI 표시

### **3. `store/useOwnerStore.ts`**
- `lastTokenValidation`: 마지막 검증 시간
- `setLastTokenValidation()`: 검증 시간 업데이트

### **4. `domains/auth/apis/auth.api.ts`**
- `refresh()`: 토큰 재발급 API (body 없이 쿠키만 사용)

## 🚀 향후 개선 사항

### **1. 주기적인 토큰 검증 (Optional)**

```typescript
// App.tsx 또는 별도의 useTokenRefresh 훅
useEffect(() => {
  // 30분마다 백그라운드에서 토큰 검증
  const interval = setInterval(async () => {
    const { isAuthenticated, accessToken, lastTokenValidation } = useOwnerStore.getState();
    
    // 마지막 검증이 30분 이상 지났으면
    if (isAuthenticated && Date.now() - (lastTokenValidation || 0) > 30 * 60 * 1000) {
      try {
        await authApi.getProfile(accessToken!);
        useOwnerStore.getState().setLastTokenValidation(Date.now());
      } catch (error) {
        // 자동 refresh는 apiClient가 처리
      }
    }
  }, 30 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

### **2. JWT 만료 시간 미리 체크 (Optional)**

```typescript
// lib/tokenUtils.ts
export function isTokenExpiringSoon(token: string, bufferMinutes = 5): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const bufferTime = bufferMinutes * 60 * 1000;
    return Date.now() >= (expirationTime - bufferTime);
  } catch {
    return true;
  }
}

// 사용
if (isTokenExpiringSoon(accessToken)) {
  // 미리 refresh 요청
}
```

## ✅ 완료된 작업

- [x] `fetchWithAuth` 유틸리티 구현
- [x] 401 에러 시 자동 토큰 재발급 로직
- [x] 동시 요청 처리 (중복 refresh 방지)
- [x] 앱 시작 시 토큰 검증
- [x] Refresh 실패 시 자동 로그아웃
- [x] zustand에 `lastTokenValidation` 추가
- [x] `auth.api.ts`의 refresh 함수 수정 (쿠키 기반)

## 🎉 결과

이제 사용자는:
- 토큰 만료를 전혀 의식하지 않아도 됨
- 자동으로 재발급되어 끊김 없는 경험 제공
- 정말 만료됐을 때만 로그아웃됨


