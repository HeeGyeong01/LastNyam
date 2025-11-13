import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useOwnerStore } from '@/store/useOwnerStore';
import { authApi } from '@/domains/auth/apis/auth.api';
import './App.css';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const { 
    isAuthenticated, 
    accessToken, 
    updateTokens, 
    logout,
    setLastTokenValidation 
  } = useOwnerStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // 로그인 상태가 아니면 검증 생략
      if (!isAuthenticated || !accessToken) {
        setIsInitializing(false);
        return;
      }

      try {
        // 프로필 API로 토큰 유효성 확인
        await authApi.getProfile(accessToken);
        console.log('✅ 토큰 유효함');
        setLastTokenValidation(Date.now());
      } catch (error) {
        // 토큰이 무효하면 refresh 시도
        console.log('🔄 토큰 만료, refresh 시도...');
        
        try {
          const refreshResponse = await authApi.refresh();
          const newAccessToken = refreshResponse.data?.accessToken;
          
          if (newAccessToken) {
            console.log('✅ 토큰 재발급 성공');
            updateTokens(newAccessToken);
            setLastTokenValidation(Date.now());
          } else {
            throw new Error('토큰 재발급 실패');
          }
        } catch (refreshError) {
          console.log('❌ Refresh 실패, 로그아웃');
          logout();
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '16px',
          color: '#666'
        }}>
          인증 확인 중...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

export default App;
