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
  const { login } = useOwnerStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('SignUp request →', { email: email.trim() });

      // API 호출
      const response = await authApi.register({
        email: email.trim(),
        password,
      });

      console.log('SignUp response ←', response);

      // 회원가입 성공 시 토큰이 있으면 로그인 상태로 설정
      if (response.data?.accessToken) {
        login(
          email.trim(),
          response.data.accessToken,
          response.data.refreshToken
        );
      }

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
    navigate('/owner/store-information/step1-document/', { replace: true });
    return true; // Modal이 자동으로 onClose를 호출하지 않도록 함
  };

  // 로그인 페이지로 이동 (X 버튼 클릭 시)
  const handleCloseModal = () => {
    setModalOpen(false);
    navigate('/owner/orders/list', { replace: true });
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
      <div className="w-full max-w-sm space-y-3">
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
          btnStyle="filled-red"
          size="lg"
          className="w-full"
          onClick={handleSignUp}
          disabled={!isFormValid || isSubmitting}
        >
          회원가입
        </Button>
      </div>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title="회원가입 완료"
        detail={`가게를 등록한 뒤 서비스 이용이 가능합니다.
                가게를 바로 등록하시겠어요?`}
        variant="single-button"
        primaryButtonText="등록하기"
        onPrimaryClick={handleStoreRegistration}
        icon="check-circle"
        iconShow={true}
        xButtonShow={false}
      />
    </div>
  );
}
