// TODO: Step1 입력값과 연동하여 기본값 설정 및 최종 등록 API 연결

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { MenuFormField } from "@/components/ui/menuFormField";
import { ImageUpload } from "@/components/ui/imageUpload";
import { Button } from "@shared/src/components/Button";

const FORM_ID = "store-information-step2-form";
const ACTION_BAR_ID = "store-information-step2-action-bar";

const CATEGORY_OPTIONS = [
  { value: "bakery", label: "제과/제빵" },
  { value: "sushi", label: "회/초밥" },
  { value: "korean", label: "한식" },
  { value: "cafe", label: "카페/디저트" },
  { value: "western", label: "양식" },
  { value: "etc", label: "기타" },
] ;

interface Step2FormValues {
  storeName: string;
  address: string;
  storeDescription: string;
  storeCategory: string;
  storeClosingTime: string;
  pickupClosingTime: string;
}

export default function StoreInformationStep2Page() {
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formValues, setFormValues] = useState<Step2FormValues>({
    storeName: "",
    address: "",
    storeDescription: "",
    storeCategory: "",
    storeClosingTime: "",
    pickupClosingTime: "",
  });

  const handleFieldChange =
    (field: keyof Step2FormValues) =>
    (
      event:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      const { value } = event.target;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleCategoryChange = (value: string | string[]) => {
    if (typeof value === "string") {
      setFormValues((prev) => ({
        ...prev,
        storeCategory: value,
      }));
    }
  };

  const handleTimeChange =
    (field: "storeClosingTime" | "pickupClosingTime") => (value: string) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: 실제 등록 API 연동 후 성공 시 이동 경로 조정
    navigate("/owner/orders/list");
  };

  const isFormValid =
    !!imageFile &&
    formValues.storeName.trim().length > 0 &&
    formValues.address.trim().length > 0 &&
    formValues.storeDescription.trim().length > 0 &&
    formValues.storeCategory.trim().length > 0 &&
    formValues.storeClosingTime.trim().length > 0 &&
    formValues.pickupClosingTime.trim().length > 0;

  return (
    <section className="relative mx-auto flex w-full max-w-[480px] flex-col gap-6 px-6 pb-32 ">
      <form
        id={FORM_ID}
        aria-describedby={ACTION_BAR_ID}
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center gap-3 px-6 py-6">
          <ImageUpload
            value={imageFile}
            onChange={setImageFile}
            variant="filled"
            maxSize={5 * 1024 * 1024}
          />
        </div>

        <MenuFormField
          title="가게 이름"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "가게 이름을 입력해주세요",
            value: formValues.storeName,
            onChange: handleFieldChange("storeName"),
            autoComplete: "organization",
          }}
        />

        <MenuFormField
          title="가게 주소"
          required
          fieldWrapperClassName="flex-1"
          titleClassName="min-w-[96px] pt-1"
          inputProps={{
            placeholder: "가게 주소를 입력해주세요",
            value: formValues.address,
            onChange: handleFieldChange("address"),
            autoComplete: "street-address",
          }}
        />

        <MenuFormField
          title="가게 상세 설명"
          required
          variant="explanation"
          className="w-full"
          textareaProps={{
            placeholder: "상세 설명을 입력하세요",
            value: formValues.storeDescription,
            onChange: handleFieldChange("storeDescription"),
            rows: 4,
            className: "min-h-[120px]",
          }}
        />

        <MenuFormField
          title="가게 카테고리"
          required
          variant="category"
          options={CATEGORY_OPTIONS}
          value={formValues.storeCategory}
          onChange={handleCategoryChange}
          fieldWrapperClassName="[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent_100%)] overflow-x-auto flex gap-2"
        />

        <MenuFormField
          title="가게 마감 시간"
          required
          variant="time"
          timeInputProps={{
            value: formValues.storeClosingTime,
            onChange: handleTimeChange("storeClosingTime"),
          }}
        />

        <MenuFormField
          title="픽업 마감 시간"
          required
          variant="time"
          timeInputProps={{
            value: formValues.pickupClosingTime,
            onChange: handleTimeChange("pickupClosingTime"),
          }}
        />
      </form>

      <div
        id={ACTION_BAR_ID}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center bg-bg-0 px-4 pb-4 pt-3"
      >
        <div className="pointer-events-auto w-full max-w-[480px] rounded-t-2xl bg-bg-0">
          <div className="px-6 pb-6">
            <Button
              type="submit"
              form={FORM_ID}
              btnStyle="filled-red"
              size="lg"
              className="w-full"
              disabled={!isFormValid}
            >
              등록 완료
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


