import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@shared/src/components/Input';
import { Button } from '@shared/src/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../../components/ui/modal';

export default function SignUpPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    try {
      setIsSubmitting(true);
      // 회원가입 호출
      setModalOpen(true);
    } catch (error) {
      console.error('회원가입 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비밀번호가 일치하고 모든 필드가 입력되었는지 확인
  const isFormValid = email && password && confirmPassword && password === confirmPassword;

  // 가게 등록 페이지로 이동
  const handleStoreRegistration = () => {
    setModalOpen(false);
    navigate('/owner/settings', { replace: true });
    return true; // Modal이 자동으로 onClose를 호출하지 않도록 함
  };

  // 로그인 페이지로 이동 (X 버튼 클릭 시)
  const handleCloseModal = () => {
    setModalOpen(false);
    navigate('/owner/orders/list', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* 로고 섹션 */}
      <div className="text-center">
        <h1 className="font-kr-h1 kr-h1 text-brand">회원가입</h1>
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
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )
          }
          onIconClick={() => setShowPassword(!showPassword)}
          showClearButton={false}
        />
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={
            showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )
          }
          onIconClick={() => setShowPassword(!showPassword)}
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
        xButtonShow={true}
      />
    </div>
  );
}
