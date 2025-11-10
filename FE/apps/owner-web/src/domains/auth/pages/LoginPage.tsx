'use client';

import { useState } from 'react';
import { Input } from '@shared/src/components/Input';
import { Button } from '@shared/src/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('로그인:', { username, password });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      {/* 로고 섹션 */}
      <div className="mb-8 text-center">
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
          <div className="relative mt-1">
             <span className="logo-outline-sm text-brand-subtle font-kr-h3 kr-h3">사장님</span>
             <span className="logo-fill-sm font-kr-h3 kr-h3">사장님</span>
          </div>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="w-full max-w-sm space-y-3">
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
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )
          }
          onIconClick={() => setShowPassword(!showPassword)}
          showClearButton={false}
        />

        <Button
          btnStyle="filled-red"
          size="lg"
          className="w-full"
          onClick={handleLogin}
        >
          로그인
        </Button>

        <div className="mt-4 text-center">
          <span className="p2-r text-secondary">아직 회원이 아니신가요? </span>
          <a href="/owner/signup" className="p2-b text-brand hover:underline">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
