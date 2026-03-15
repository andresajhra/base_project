interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  // agrega más aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}