const DEFAULT_OWNER_API_BASE_URL = "https://k13a101.p.ssafy.io";
const OWNER_API_BASE_URL =
  import.meta.env.VITE_OWNER_API_BASE_URL ?? DEFAULT_OWNER_API_BASE_URL;

export interface BusinessLicenseOcrData {
  taxType?: string | null;
  registerNumber?: string | null;
  companyName?: string | null;
  repName?: string | null;
  birth?: string | null;
  openDate?: string | null;
  bisAddress?: string | null;
}

interface BusinessLicenseUploadResponse {
  status: "SUCCESS" | "FAIL" | "ERROR";
  code: number;
  message: string;
  data?: BusinessLicenseOcrData | null;
}

const BUSINESS_LICENSE_ENDPOINT = "/api/owner/business-license";

export async function uploadBusinessLicense(
  file: File,
  accessToken?: string | null,
): Promise<BusinessLicenseOcrData> {
  const url = `${OWNER_API_BASE_URL.replace(/\/$/, "")}${BUSINESS_LICENSE_ENDPOINT}`;
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
      body: formData,
      credentials: "include",
    });
  } catch (error) {
    throw new Error("사업자 등록증 업로드에 실패했습니다. 네트워크 연결을 확인해주세요.");
  }

  let body: BusinessLicenseUploadResponse | null = null;
  try {
    body = (await response.json()) as BusinessLicenseUploadResponse | null;
  } catch (error) {
    // ignore JSON parse errors handled below
  }

  if (!response.ok || body?.status !== "SUCCESS" || !body.data) {
    throw new Error(
      body?.message ??
        "사업자 등록증 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }

  return body.data;
}

export interface CreateShopRequest {
  shopName: string;
  shopLat: number;
  shopLng: number;
  shopAddress: string;
  shopDescription: string;
  shopBanner: string;
  shopCloses: string;
  shopPickupEndTime: string;
  category: string;
}

interface ApiResponse<T> {
  status: "SUCCESS" | "FAIL" | "ERROR";
  code: number;
  message: string;
  data?: T | null;
}

interface CreateShopResponseData {
  shopId: number;
}

const createShopEndpoint = (ownerId: number) => `/api/owner/${ownerId}/shop`;

export async function createShop(
  ownerId: number,
  payload: CreateShopRequest,
  accessToken?: string | null,
): Promise<CreateShopResponseData> {
  const url = `${OWNER_API_BASE_URL.replace(/\/$/, "")}${createShopEndpoint(ownerId)}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("가게 등록 요청에 실패했습니다. 네트워크 연결을 확인해주세요.");
  }

  let responseBody: ApiResponse<CreateShopResponseData> | null = null;
  try {
    responseBody = (await response.json()) as ApiResponse<CreateShopResponseData> | null;
  } catch (error) {
    // ignore JSON parse errors handled below
  }

  if (
    !response.ok ||
    responseBody?.status !== "SUCCESS" ||
    !responseBody.data?.shopId
  ) {
    throw new Error(
      responseBody?.message ??
        "가게 등록에 실패했습니다. 잠시 후 다시 시도해주세요.",
    );
  }

  return responseBody.data;
}

export const storeInformationApi = {
  uploadBusinessLicense,
  createShop,
};


