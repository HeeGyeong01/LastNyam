// TODO: 사업자 등록증 OCR 연동 후 자동 입력 값과 연동

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MenuFormField } from "@/components/ui/menuFormField";
import { Button } from "@shared/src/components/Button";

interface StoreInformationFormValues {
  businessType: string;
  registrationNumber: string;
  storeName: string;
  ownerName: string;
  birthDate: string;
  openingDate: string;
  address: string;
}

const FORM_ID = "store-information-step1-form";
const ACTION_BAR_ID = "store-information-step1-action-bar";

export default function StoreInformationStep1InputPage() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<StoreInformationFormValues>({
    businessType: "",
    registrationNumber: "",
    storeName: "",
    ownerName: "",
    birthDate: "",
    openingDate: "",
    address: "",
  });

  const handleInputChange =
    (field: keyof StoreInformationFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: Step2 페이지로 넘기기 전에 서버 저장 또는 상태 관리 로직 연결
    navigate("/owner/store-information/step2");
  };

  const isFormValid = Object.values(formValues).every(
    (value) => value.trim().length > 0,
  );

  return (
    <section className="relative mx-auto flex w-full max-w-[412px] flex-col gap-8 px-4 pb-32 pt-8">
      <form
        id={FORM_ID}
        aria-describedby={ACTION_BAR_ID}
        className="flex flex-col gap-7"
        onSubmit={handleSubmit}
      >
        <MenuFormField
          title="구분"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "예) 일반 과세자",
            value: formValues.businessType,
            onChange: handleInputChange("businessType"),
            autoComplete: "off",
          }}
        />

        <MenuFormField
          title="등록번호"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "예) 123-45-67890",
            value: formValues.registrationNumber,
            onChange: handleInputChange("registrationNumber"),
            autoComplete: "off",
            inputMode: "numeric",
            maxLength: 12,
          }}
        />

        <MenuFormField
          title="상호"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "예) SSAFY 붕어빵",
            value: formValues.storeName,
            onChange: handleInputChange("storeName"),
            autoComplete: "organization",
          }}
        />

        <MenuFormField
          title="성명"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "예) 홍길동",
            value: formValues.ownerName,
            onChange: handleInputChange("ownerName"),
            autoComplete: "name",
          }}
        />

        <MenuFormField
          title="생년월일"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "예) 1900년 01월 01일",
            value: formValues.birthDate,
            onChange: handleInputChange("birthDate"),
            autoComplete: "bday",
          }}
        />

        <MenuFormField
          title="개업연월일"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "예) 2020년 01월 01일",
            value: formValues.openingDate,
            onChange: handleInputChange("openingDate"),
            autoComplete: "off",
          }}
        />

        <MenuFormField
          title="사업장소재지"
          required
          variant="explanation"
          className="w-full"
          textareaProps={{
            placeholder: "사업장 주소를 입력하세요",
            value: formValues.address,
            onChange: handleInputChange("address"),
            rows: 3,
            autoComplete: "street-address",
            className: "min-h-[80px]",
          }}
        />

      </form>
      <div
        id={ACTION_BAR_ID}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center bg-bg-0 px-4 pb-4 pt-3"
      >
        <div className="pointer-events-auto w-full max-w-[412px] rounded-t-2xl bg-bg-0">
          <div className="px-5 pb-5">
            <Button
              type="submit"
              form={FORM_ID}
              btnStyle="filled-red"
              size="lg"
              className="w-full"
              disabled={!isFormValid}
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


