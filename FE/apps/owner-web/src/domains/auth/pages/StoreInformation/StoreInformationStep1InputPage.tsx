// TODO: 사업자 등록증 OCR 연동 후 자동 입력 값과 연동

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuFormField } from "@/components/ui/menuFormField";
import { Button } from "@shared/src/components/Button";
import type { BusinessLicenseOcrData } from "../../apis/storeInformation.api";

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

const formatRegistrationNumberDigits = (digits: string) => {
  if (!digits) return "";

  const safeDigits = digits.slice(0, 10);
  const part1 = safeDigits.slice(0, 3);
  const part2 = safeDigits.slice(3, 5);
  const part3 = safeDigits.slice(5, 10);

  const segments = [];
  if (part1) segments.push(part1);
  if (part2) segments.push(part2);
  if (part3) segments.push(part3);

  return segments.join("-");
};

const formatKoreanDateDigits = (digits: string) => {
  if (!digits) return "";

  const safeDigits = digits.slice(0, 8);
  const len = safeDigits.length;
  const year = safeDigits.slice(0, 4);

  if (len <= 4) {
    return safeDigits;
  }

  if (len <= 6) {
    const monthRaw = safeDigits.slice(4);
    const monthFormatted = len === 6 ? `${monthRaw}월` : monthRaw;
    return `${year}년 ${monthFormatted}`.trim();
  }

  const month = safeDigits.slice(4, 6);

  if (len < 8) {
    const day = safeDigits.slice(6);
    return `${year}년 ${month}월 ${day}`.trim();
  }

  const day = safeDigits.slice(6, 8);
  return `${year}년 ${month}월 ${day}일`;
};

export default function StoreInformationStep1InputPage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    const state = location.state as { businessLicense?: BusinessLicenseOcrData } | null;
    const businessLicense = state?.businessLicense;

    if (!businessLicense) {
      console.log("ℹ️ 사업자등록증 state 없음 - 직접 입력 상태");
      return;
    }

    console.log("📥 전달받은 사업자등록증 state:", businessLicense);

    const formatDigits = (value?: string | null) => value?.replace?.(/\D/g, "") ?? "";

    setFormValues((prev) => {
      const nextValues: StoreInformationFormValues = {
        ...prev,
        businessType: businessLicense.taxType?.trim() ?? prev.businessType,
        registrationNumber: formatRegistrationNumberDigits(formatDigits(businessLicense.registerNumber)),
        storeName: businessLicense.companyName?.trim() ?? prev.storeName,
        ownerName: businessLicense.repName?.trim() ?? prev.ownerName,
        birthDate: formatKoreanDateDigits(formatDigits(businessLicense.birth)),
        openingDate: formatKoreanDateDigits(formatDigits(businessLicense.openDate)),
        address: businessLicense.bisAddress?.trim() ?? prev.address,
      };

      console.log("🧾 사업자등록증 기반 자동 입력 값:", nextValues);

      return nextValues;
    });
  }, [location.state]);

  const handleRegistrationNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const previousDigits = formValues.registrationNumber.replace(/\D/g, "");
    let nextDigits = event.target.value.replace(/\D/g, "").slice(0, 10);

    const nativeEvent = event.nativeEvent as InputEvent | undefined;
    if (
      nativeEvent?.inputType === "deleteContentBackward" &&
      nextDigits === previousDigits
    ) {
      nextDigits = previousDigits.slice(0, -1);
    }

    const formatted = formatRegistrationNumberDigits(nextDigits);
    setFormValues((prev) => ({
      ...prev,
      registrationNumber: formatted,
    }));
  };

  const handleDateChange =
    (field: "birthDate" | "openingDate") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const previousDigits = formValues[field].replace(/\D/g, "");
      let nextDigits = event.target.value.replace(/\D/g, "").slice(0, 8);

      const nativeEvent = event.nativeEvent as InputEvent | undefined;
      if (
        nativeEvent?.inputType === "deleteContentBackward" &&
        nextDigits === previousDigits
      ) {
        nextDigits = previousDigits.slice(0, -1);
      }

      const formatted = formatKoreanDateDigits(nextDigits);
      setFormValues((prev) => ({
        ...prev,
        [field]: formatted,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: Step2 페이지로 넘기기 전에 서버 저장 또는 상태 관리 로직 연결
    navigate("/owner/store-information/step2", {
      state: {
        fromStep1: {
          storeName: formValues.storeName,
          address: formValues.address,
        },
      },
    });
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
            onChange: handleRegistrationNumberChange,
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
            onChange: handleDateChange("birthDate"),
            autoComplete: "bday",
            inputMode: "numeric",
            maxLength: 15,
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
            onChange: handleDateChange("openingDate"),
            autoComplete: "off",
            inputMode: "numeric",
            maxLength: 15,
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


