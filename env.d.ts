/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_USER_ID: string;
  readonly VITE_GEOSERVER_AUTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
