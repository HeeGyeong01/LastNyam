import { Outlet } from "react-router-dom";

import LargeHeader, { type LargeHeaderProps } from "@/components/ui/owner/LargeHeader";
import { cn } from "@/lib/utils";

interface LargeHeaderOnlyLayoutProps {
  headerProps: LargeHeaderProps;
  /**
   * 레이아웃의 메인 래퍼에 추가적으로 적용할 클래스
   */
  mainClassName?: string;
  /**
   * 콘텐츠 컨테이너에 적용할 클래스
   */
  contentClassName?: string;
}

export default function LargeHeaderOnlyLayout({
  headerProps,
  mainClassName,
  contentClassName,
}: LargeHeaderOnlyLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-0">
      <LargeHeader {...headerProps} />

      <main className={cn("flex-1 px-6 pb-12", mainClassName)}>
        <div className={cn("mx-auto w-full", contentClassName)}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}


