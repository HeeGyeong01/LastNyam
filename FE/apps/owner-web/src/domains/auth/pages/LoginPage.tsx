'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@shared/src/components/Input';
import { Button } from '@shared/src/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authApi } from '../apis/auth.api';
import { useOwnerStore } from '../../../store/useOwnerStore';
import { Modal } from '../../../components/ui/modal';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setShops } = useOwnerStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleLogin = async () => {
    if (!username || !password || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('Login request →', { email: username.trim() });

      // API 호출
      const response = await authApi.login({
        email: username.trim(),
        password,
      });

      console.log('✅ Login response ←', response);
      console.log('🔍 Response 타입:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response));
      console.log('🔍 Response.data 존재?', 'data' in response);
      console.log('🔍 Response.status:', response.status);
      console.log('🔍 Response.code:', response.code);

      // 로그인 성공 시 토큰 저장
      if (response.data?.accessToken) {
        console.log('✅ AccessToken 확인됨:', response.data.accessToken);
        const accessToken = response.data.accessToken;
        
        // 프로필 조회로 ownerId 얻기
        try {
          console.log('🔍 프로필 조회 시작...');
          const profileResponse = await authApi.getProfile(accessToken);
          console.log('✅ Profile response ←', profileResponse);
          
          const ownerId = profileResponse.data?.ownerId;
          console.log('✅ OwnerId:', ownerId);
          
          if (!ownerId) {
            console.error('❌ OwnerId가 없습니다.');
            throw new Error('사용자 정보를 가져올 수 없습니다.');
          }

          // store에 로그인 정보 저장
          console.log('💾 Store에 로그인 정보 저장 중...');
          login(
            username.trim(),
            accessToken,
            response.data.refreshToken,
            ownerId
          );
          console.log('✅ Store 저장 완료');
          
          // 가게 목록 조회
          try {
            console.log('🔍 가게 목록 조회 시작... ownerId:', ownerId);
            const shopsResponse = await authApi.getShops(ownerId, accessToken);
            console.log('✅ Shop list response ←', shopsResponse);
            console.log('📊 Response status:', shopsResponse.status);
            console.log('📊 Shops data:', shopsResponse.data?.shops);

            // 응답이 FAIL이거나 가게가 없으면 모달 표시
            if (shopsResponse.status === 'FAIL' || 
                !shopsResponse.data?.shops || 
                shopsResponse.data.shops.length === 0) {
              console.log('⚠️ 가게가 없음 → 모달 표시');
              setShowShopModal(true);
            } else {
              console.log('✅ 가게 목록 있음:', shopsResponse.data.shops.length, '개');
              // 가게 정보를 store에 저장
              console.log('💾 Store에 가게 정보 저장 중...');
              setShops(shopsResponse.data.shops);
              console.log('✅ 가게 정보 저장 완료');
              
              // 가게가 있으면 주문 목록 페이지로 이동
              console.log('🚀 주문 목록 페이지로 이동 중...');
              navigate('/owner/orders/list', { replace: true });
              console.log('✅ navigate 호출 완료');
            }
          } catch (shopError) {
            console.error('❌ 가게 목록 조회 오류:', shopError);
            // 가게 목록 조회 실패 시 모달 표시
            setShowShopModal(true);
          }
        } catch (profileError) {
          console.error('❌ 프로필 조회 오류:', profileError);
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }
      } else {
        console.error('❌ AccessToken이 없습니다. response.data:', response.data);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      const message =
        error instanceof Error
          ? error.message
          : '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterShop = () => {
    setShowShopModal(false);
    navigate('/owner/store-information/step1-document');
  };

  return (
    <>
      <div className="flex mx-[52px] min-h-screen flex-col items-center justify-center bg-white">
        {/* 로고 섹션 */}
        <div className="mb-4 text-center">
           <div className="logo-wrapper inline-flex flex-col items-center leading-none">
            {/* LAST */}
            <div className="relative">
               <span className="logo-outline text-brand font-en-h1 en-h1">LAST</span>
               <span className="logo-fill font-en-h1 en-h1">LAST</span>
            </div>
            {/* NYAM */}
            <div className="relative -mt-4">
               <span className="logo-outline text-brand font-en-h1 en-h1">NYAM</span>
               <span className="logo-fill font-en-h1 en-h1">NYAM</span>
            </div>
            {/* 사장님 */}
            <div className="relative -mt-2">
               <span className="logo-outline-sm text-brand-subtle font-kr-h3 kr-h3">사장님</span>
               <span className="logo-fill-sm font-kr-h3 kr-h3">사장님</span>
            </div>
          </div>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
          <Input
            placeholder="아이디를 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            showClearButton={false}
          />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={
              showPassword ? (
                <EyeIcon className="w-5 h-5" />
              ) : (
                <EyeSlashIcon className="w-5 h-5" />
              )
            }
            onIconClick={() => setShowPassword(!showPassword)}
            showClearButton={false}
          />

          <Button
            type="submit"
            btnStyle="filled-red"
            size="lg"
            className="w-full"
            disabled={!username || !password || isSubmitting}
          >
            로그인
          </Button>

          <div className="mt-4 text-center">
            <span className="p2-r text-secondary">아직 회원이 아니신가요? </span>
            <a href="/owner/signup" className="p2-b text-brand hover:underline">
              회원가입
            </a>
          </div>
        </form>
      </div>

      {/* 가게 등록 모달 */}
      <Modal
        open={showShopModal}
        onClose={() => {}}
        title="가게를 등록하시겠어요?"
        detail={
          <>
            등록된 가게가 없습니다.
            <br />
            가게를 등록하고 서비스를 이용하세요.
          </>
        }
        icon="exclamation"
        variant="single-button"
        xButton={false}
        primaryButtonText="가게 등록하기"
        onPrimaryClick={handleRegisterShop}
      />
    </>
  );
}
