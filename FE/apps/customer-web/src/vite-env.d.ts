/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 필요한 환경변수 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
