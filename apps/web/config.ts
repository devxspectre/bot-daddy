// Strip trailing slash to prevent double-slash issues causing CORS redirects
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')