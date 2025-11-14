const DEFAULT_OWNER_API_BASE_URL = "https://lastnyam.co.kr";
const OWNER_API_BASE_URL =
  import.meta.env.VITE_OWNER_API_BASE_URL ?? DEFAULT_OWNER_API_BASE_URL;

export type OwnerFileType = "MENU_IMAGE" | "SHOP_PROFILE_IMAGE";

export interface CreateUploadUrlRequest {
  fileName: string;
  fileType: OwnerFileType;
  fileSize: number;
}

export interface PresignedUploadPayload {
  uploadUrl: string;
  fileKey: string;
  bucket: string;
  expiresAt: string;
  fileUrl: string;
  httpMethod?: string;
}

interface CreateUploadUrlResponse {
  status: "SUCCESS" | "FAIL" | "ERROR";
  message: string;
  code?: number;
  data?: PresignedUploadPayload | null;
}

const FILE_UPLOAD_ENDPOINT = "/api/owner/file/upload-url";

export async function createOwnerFileUploadUrl(
  params: CreateUploadUrlRequest,
  accessToken?: string | null
): Promise<PresignedUploadPayload> {
  const url = `${OWNER_API_BASE_URL.replace(/\/$/, "")}${FILE_UPLOAD_ENDPOINT}`;

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
      body: JSON.stringify(params),
    });
  } catch (error) {
    throw new Error("업로드 URL 생성 요청에 실패했습니다. 네트워크 연결을 확인해주세요.");
  }

  let responseBody: CreateUploadUrlResponse | null = null;
  try {
    responseBody = (await response.json()) as CreateUploadUrlResponse | null;
  } catch (error) {
    // ignore json parse error
  }

  if (!response.ok || responseBody?.status !== "SUCCESS" || !responseBody.data) {
    throw new Error(
      responseBody?.message ??
        "업로드 URL 생성에 실패했습니다. 잠시 후 다시 시도해주세요."
    );
  }

  return responseBody.data;
}

export const ownerFileApi = {
  createUploadUrl: createOwnerFileUploadUrl,
};



