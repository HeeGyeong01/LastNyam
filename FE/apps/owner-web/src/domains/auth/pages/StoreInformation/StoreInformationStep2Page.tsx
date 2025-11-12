// TODO: Step1 입력값과 연동하여 기본값 설정 및 최종 등록 API 연결

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { MenuFormField } from "@/components/ui/menuFormField";
import { ImageUpload, type UploadedFileInfo } from "@/components/ui/imageUpload";
import { useOwnerStore } from "@/store/useOwnerStore";
import { Button } from "@shared/src/components/Button";
import {
  storeInformationApi,
  type CreateShopRequest,
} from "../../apis/storeInformation.api";

const FORM_ID = "store-information-step2-form";
const ACTION_BAR_ID = "store-information-step2-action-bar";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "베이커리", label: "베이커리" },
  { value: "회/초밥", label: "회/초밥" },
  { value: "김밥/분식", label: "김밥/분식" },
  { value: "샐러드/포케", label: "샐러드/포케" },
  { value: "기타", label: "기타" },
];

const DEFAULT_SHOP_LAT = 37.501452;
const DEFAULT_SHOP_LNG = 127.039474;

interface Step2FormValues {
  storeName: string;
  address: string;
  storeDescription: string;
  storeCategory: string;
  storeClosingTime: string;
  pickupClosingTime: string;
}

interface FromStep1State {
  storeName?: string | null;
  address?: string | null;
  shopLat?: number | null;
  shopLng?: number | null;
  lat?: number | null;
  lng?: number | null;
  storeLat?: number | null;
  storeLng?: number | null;
  storeCategory?: string | null;
}

interface Step2LocationState {
  fromStep1?: FromStep1State;
}

const toFullTime = (time: string) => {
  if (!time) {
    return time;
  }
  return time.length === 5 && time.includes(":") ? `${time}:00` : time;
};

const resolveCategoryValue = (rawValue: string) => {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return "";
  }
  const matched = CATEGORY_OPTIONS.find(
    (option) => option.value === trimmed || option.label === trimmed,
  );
  return matched?.value ?? trimmed;
};

export default function StoreInformationStep2Page() {
  const navigate = useNavigate();
  const location = useLocation();

  const accessToken = useOwnerStore((state) => state.accessToken);
  const ownerId = useOwnerStore((state) => state.ownerId);
  const shops = useOwnerStore((state) => state.shops);
  const setShops = useOwnerStore((state) => state.setShops);

  const [imageFile, setImageFile] = useState<UploadedFileInfo | null>(null);
  const [formValues, setFormValues] = useState<Step2FormValues>({
    storeName: "",
    address: "",
    storeDescription: "",
    storeCategory: "",
    storeClosingTime: "",
    pickupClosingTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromStep1Ref = useRef<FromStep1State | null>(null);

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

    void (async () => {
      if (isSubmitting) {
        return;
      }

      if (!imageFile?.fileUrl) {
        alert("가게 배너 이미지를 등록해주세요.");
        return;
      }

      if (!ownerId || !accessToken) {
        alert("가게 등록을 위해 다시 로그인해주세요.");
        return;
      }

      const fromStep1 = fromStep1Ref.current;

      setIsSubmitting(true);

      try {
        const categoryName = resolveCategoryValue(
          formValues.storeCategory ||
            fromStep1?.storeCategory ||
            "",
        ).trim();

        if (!categoryName) {
          throw new Error("가게 카테고리를 선택해주세요.");
        }

        const payload: CreateShopRequest = {
          shopName: formValues.storeName.trim(),
          shopLat: DEFAULT_SHOP_LAT,
          shopLng: DEFAULT_SHOP_LNG,
          shopAddress: formValues.address.trim(),
          shopDescription: formValues.storeDescription.trim(),
          shopBanner: imageFile.fileUrl,
          shopCloses: toFullTime(formValues.storeClosingTime.trim()),
          shopPickupEndTime: toFullTime(formValues.pickupClosingTime.trim()),
          category: categoryName,
        };

        const createShopResponse = await storeInformationApi.createShop(
          ownerId,
          payload,
          accessToken,
        );

        const { shopId } = createShopResponse;

        if (!shopId) {
          throw new Error("가게 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }

        const createdShop = {
          shopId,
          shopName: payload.shopName,
          shopLat: payload.shopLat,
          shopLng: payload.shopLng,
          shopAddress: payload.shopAddress,
          shopDescription: payload.shopDescription,
          shopBanner: payload.shopBanner,
          shopCloses: payload.shopCloses,
          shopPickupEndTime: payload.shopPickupEndTime,
          categoryName: payload.category,
        };

        const nextShops = [
          ...shops.filter((shop) => shop.shopId !== shopId),
          createdShop,
        ];

        setShops(nextShops);

        alert("가게 등록이 완료되었습니다.");
        navigate("/owner/orders/list", { replace: true });
      } catch (error) {
        console.error("⚠️ 가게 등록 실패:", error);
        const message =
          error instanceof Error
            ? error.message
            : "가게 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
        alert(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const isFormValid =
    !!imageFile &&
    formValues.storeName.trim().length > 0 &&
    formValues.address.trim().length > 0 &&
    formValues.storeDescription.trim().length > 0 &&
    formValues.storeCategory.trim().length > 0 &&
    formValues.storeClosingTime.trim().length > 0 &&
    formValues.pickupClosingTime.trim().length > 0;

  useEffect(() => {
    const state = location.state as Step2LocationState | null;

    const fromStep1 = state?.fromStep1;

    if (!fromStep1) {
      return;
    }

    fromStep1Ref.current = fromStep1;
    const trimmedCategory = fromStep1.storeCategory?.trim();
    const matchedCategory = trimmedCategory
      ? CATEGORY_OPTIONS.find(
          (option) =>
            option.value === trimmedCategory || option.label === trimmedCategory,
        )
      : null;

    setFormValues((prev) => ({
      ...prev,
      storeName: fromStep1.storeName?.trim() ?? prev.storeName,
      address: fromStep1.address?.trim() ?? prev.address,
      storeCategory: matchedCategory?.value ?? prev.storeCategory,
    }));
  }, [location.state]);

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
            fileType="SHOP_PROFILE_IMAGE"
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
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "등록 완료"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


