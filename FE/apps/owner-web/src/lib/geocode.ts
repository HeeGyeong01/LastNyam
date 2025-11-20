const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;

type V2Address = {
  x: string;
  y: string;
  roadAddress?: string;
  jibunAddress?: string;
};

type V2Response = {
  status?: string;
  v2?: {
    addresses?: V2Address[];
  };
  addresses?: V2Address[];
  errorMessage?: string;
};

type LegacyResponse = {
  result?: {
    items?: Array<{
      point?: { x?: string | number; y?: string | number };
      x?: string | number;
      y?: string | number;
    }>;
  };
};

declare global {
  interface Window {
    naver?: {
      maps?: {
        Service?: {
          Status: {
            OK: string;
          };
          geocode: (
            params: Record<string, unknown>,
            callback: (status: string, response: V2Response & LegacyResponse) => void,
          ) => void;
        };
      };
    };
  }
}

let naverScriptPromise: Promise<void> | null = null;

function ensureNaverMapsScript(): Promise<void> {
  if (window.naver?.maps?.Service) {
    return Promise.resolve();
  }

  if (!NAVER_MAP_CLIENT_ID) {
    return Promise.reject(
      new Error("네이버 지도 API 키가 설정되지 않았습니다. VITE_NAVER_MAP_CLIENT_ID를 확인해주세요."),
    );
  }

  if (!naverScriptPromise) {
    naverScriptPromise = new Promise((resolve, reject) => {
      const waitForService = (attempt = 0) => {
        if (window.naver?.maps?.Service) {
          resolve();
          return;
        }

        if (attempt >= 20) {
          naverScriptPromise = null;
          reject(new Error("네이버 지도 서비스가 초기화되지 않았습니다."));
          return;
        }

        setTimeout(() => waitForService(attempt + 1), 100);
      };

      const existing = document.querySelector<HTMLScriptElement>(
        `script[src*="naver.com/openapi/v3/maps.js"]`,
      );

      if (existing) {
        if (window.naver?.maps?.Service) {
          resolve();
          return;
        }

        existing.addEventListener("load", () => {
          waitForService();
        }, { once: true });
        existing.addEventListener(
          "error",
          () => {
            naverScriptPromise = null;
            reject(new Error("네이버 지도 스크립트를 로드하는 중 오류가 발생했습니다."));
          },
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", () => {
        waitForService();
      }, { once: true });
      script.addEventListener(
        "error",
        () => {
          naverScriptPromise = null;
          reject(new Error("네이버 지도 스크립트를 로드하는 중 오류가 발생했습니다."));
        },
        { once: true },
      );
      document.head.appendChild(script);
    });
  }

  return naverScriptPromise;
}

function parseLatLng(response: V2Response & LegacyResponse) {
  const v2Address =
    response.v2?.addresses?.[0] ??
    response.addresses?.[0];

  if (v2Address?.x && v2Address?.y) {
    const lat = Number.parseFloat(String(v2Address.y));
    const lng = Number.parseFloat(String(v2Address.x));
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng };
    }
  }

  const legacyItem =
    response.result?.items?.[0];

  if (legacyItem) {
    const x = legacyItem.point?.x ?? legacyItem.x;
    const y = legacyItem.point?.y ?? legacyItem.y;

    if (x !== undefined && y !== undefined) {
      const lat = Number.parseFloat(String(y));
      const lng = Number.parseFloat(String(x));
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  throw new Error("네이버 지오코딩 결과에서 좌표를 찾을 수 없습니다.");
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const query = address.trim();
  if (!query) {
    throw new Error("주소가 비어있어 좌표를 계산할 수 없습니다.");
  }

  await ensureNaverMapsScript();

  const service = window.naver?.maps?.Service;
  if (!service) {
    naverScriptPromise = null;
    throw new Error("네이버 지도 서비스가 초기화되지 않았습니다.");
  }

  const okStatus = service.Status?.OK ?? "OK";

  return new Promise((resolve, reject) => {
    service.geocode(
      { query, address: query },
      (status, response) => {
        if (status !== okStatus) {
          reject(new Error("네이버 지오코딩 서비스 호출에 실패했습니다."));
          return;
        }

        try {
          const coordinates = parseLatLng(response);
          resolve(coordinates);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      },
    );
  });
}



