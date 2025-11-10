import { cn } from "@/lib/utils";

export interface LargeHeaderProps {
  pageName: string;
  pageExplanation?: string;
  /**
   * 현재 단계 (1부터 시작). 정의되지 않으면 단계 표시가 숨겨집니다.
   */
  currentStep?: number;
  /**
   * 전체 단계 수. 기본값은 2단계입니다.
   */
  totalSteps?: number;
  className?: string;
}

export function LargeHeader({
  pageName,
  pageExplanation,
  currentStep,
  totalSteps = 2,
  className,
}: LargeHeaderProps) {
  const showSteps = typeof currentStep === "number" && totalSteps > 1;

  return (
    <section
      className={cn(
        "w-full bg-bg-0 text-primary",
        "flex flex-col items-center text-center",
        "py-6 gap-2",
        className,
      )}
    >
        <div className="flex flex-col items-center gap-1">
            <h2 className="h3-b md:h2-b text-primary">{pageName}</h2>
            {pageExplanation && (
                <p className="p2 text-secondary">{pageExplanation}</p>
            )}
        </div>

      {showSteps && (
        <div className="flex items-center gap-2.5" aria-hidden>
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;

            return (
              <span
                key={stepNumber}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  isActive ? "bg-brand" : "bg-bg-3",
                )}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default LargeHeader;

