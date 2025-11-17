import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@shared/src/components/Input';
import { Button } from '@shared/src/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../../components/ui/modal';
import { authApi } from '../apis/auth.api';
import { useOwnerStore } from '../../../store/useOwnerStore';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login, setShops, setShouldPreventPublicRedirect } = useOwnerStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSignUp();
  };

  const handleSignUp = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('🔐 회원가입 요청 데이터:');
      console.log('  - Email:', email.trim());
      console.log('  - Password:', password);
      console.log('  - Password 길이:', password.length);
      console.log('  - Password 타입:', typeof password);

      // API 호출
      const response = await authApi.register({
        email: email.trim(),
        password,
      });

      console.log('SignUp response ←', response);

      // 회원가입 성공 후 로그인 처리
      let accessToken = response.data?.accessToken ?? null;
      let refreshToken = response.data?.refreshToken ?? null;

      // 회원가입 응답에 토큰이 없으면 자동 로그인
      if (!accessToken) {
        console.log('⚠️ 회원가입 응답에 토큰이 없습니다. 자동 로그인을 시도합니다.');
        const loginResponse = await authApi.login({
          email: email.trim(),
          password,
        });

        accessToken = loginResponse.data?.accessToken ?? null;
        refreshToken = loginResponse.data?.refreshToken ?? null;
        console.log('✅ 자동 로그인 완료. AccessToken:', accessToken ? '있음' : '없음');
      }

      if (!accessToken) {
        throw new Error('토큰을 가져오지 못했습니다. 로그인 후 다시 시도해주세요.');
      }

      // 프로필 조회로 ownerId 얻기
      const profileResponse = await authApi.getProfile(accessToken);
      const ownerId = profileResponse.data?.ownerId;

      if (!ownerId) {
        console.error('❌ OwnerId가 없습니다.');
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      console.log('✅ OwnerId:', ownerId);

      // 리다이렉트 방지 설정 (모달을 띄우기 위해)
      setShouldPreventPublicRedirect(true);
      
      login(
        email.trim(),
        accessToken,
        refreshToken ?? undefined,
        ownerId
      );

      // 가게 목록 초기화 (아직 가게가 없으므로)
      setShops([]);

      setModalOpen(true);
    } catch (error) {
      console.error('회원가입 오류:', error);
      const message =
        error instanceof Error
          ? error.message
          : '회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비밀번호가 일치하고 모든 필드가 입력되었는지 확인
  const isFormValid = email && password && confirmPassword && password === confirmPassword;

  // 가게 등록 페이지로 이동
  const handleStoreRegistration = () => {
    setModalOpen(false);
    // navigate를 먼저 호출하고, 이동 후에 플래그 해제
    navigate('/store-information/step1-document', { replace: true });
    // 페이지 이동 후 플래그 해제 (약간의 지연)
    setTimeout(() => {
      setShouldPreventPublicRedirect(false);
    }, 100);
  };

  return (
    <div className="mx-[52px] flex flex-col items-center justify-center min-h-screen">
      {/* 로고 섹션 */}
      <div className="text-center mb-12">
        <div className="inline-flex flex-col items-center leading-none">
          <span className="logo-fill font-kr-h1 kr-h1">회원가입</span>
        </div>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <Input
          placeholder="아이디 (이메일 주소)"
          value={email}
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
          onIconClick={() => setShowPassword((prev) => !prev)}
          showClearButton={false}
        />
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={
            showConfirmPassword ? (
              <EyeIcon className="w-5 h-5" />
            ) : (
              <EyeSlashIcon className="w-5 h-5" />
            )
          }
          onIconClick={() => setShowConfirmPassword((prev) => !prev)}
          showClearButton={false}
        />

        {/* 회원가입 버튼 */}
        <Button
          type="submit"
          btnStyle="filled-red"
          size="lg"
          className="w-full"
          disabled={!isFormValid || isSubmitting}
        >
          회원가입
        </Button>
      </form>
      <Modal
        open={modalOpen}
        onClose={() => {}} // 빈 함수로 모달 닫기 방지
        title="회원가입 완료"
        detail={`가게를 등록한 뒤 서비스 이용이 가능합니다.
                가게를 바로 등록하시겠어요?`}
        variant="single-button"
        primaryButtonText="등록하기"
        onPrimaryClick={handleStoreRegistration}
        icon="check-circle"
        iconShow={true}
        xButtonShow={false}
        xButton={false} // X 버튼 자체를 표시하지 않음
      />
    </div>
  );
}
