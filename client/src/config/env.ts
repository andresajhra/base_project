const getEnvVar = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key]
  if (!value) throw new Error(`Missing env variable: ${key}`)
  return value
}

export const env = {
  apiUrl: getEnvVar('VITE_API_URL'),
  appName: getEnvVar('VITE_APP_NAME'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const