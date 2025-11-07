import LargeHeader from "@/components/ui/owner/LargeHeader";

export default function StoreInformationStep1InputPage() {
  return (
    <main className="min-h-screen bg-bg-0">
      <LargeHeader
        pageName="가게 등록하기"
        pageExplanation="가게 정보를 입력하고 서비스를 이용하세요"
        currentStep={1}
        totalSteps={2}
      />

      <section className="px-6 pb-12">
        {/* TODO: 가게 기본 정보 입력 폼 */}
      </section>
    </main>
  );
}

