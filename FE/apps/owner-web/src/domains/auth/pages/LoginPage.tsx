import { useState } from 'react';
import { Input } from '@shared/src/components/Input';
import { Button } from '@shared/src/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      // 로그인 호출
    } catch (error) {
      console.error('로그인 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* 로고 섹션 */}
      <div className="text-center">
        <h1 className="font-en-h1 en-h1 text-brand">LAST</h1>
        <h1 className="font-en-h1 en-h1 text-brand">NYAM</h1>
        <h2 className="font-kr-h3 kr-h3 text-brand-subtle">사장님</h2>
      </div>

      {/* 입력 폼 */}
      <div className="w-full max-w-sm space-y-3">
        <Input
          placeholder="아이디를 입력하세요"
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

        {/* 로그인 버튼 */}
        <Button
          btnStyle="filled-red"
          size="lg"
          className="w-full"
          onClick={handleLogin}
          disabled={isSubmitting}
        >
          로그인
        </Button>

        {/* 회원가입 링크 */}
        <div className="text-center mt-4">
          <span className="p2-r text-primary">아직 회원이 아니신가요? </span>
          <a href="/owner/signup" className="p2-b text-brand hover:underline ml-1">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}