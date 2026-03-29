import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const parsePort = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)

  if (Number.isInteger(parsed) && parsed > 0 && parsed < 65536) {
    return parsed
  }

  return fallback
}

const parseHost = (value: string | undefined) => {
  const host = value?.trim()

  if (!host || host === 'localhost') {
    return '127.0.0.1'
  }

  return host
}

const parseAllowedHosts = (value: string | undefined) =>
  value
    ?.split(',')
    .map((host) => host.trim())
    .filter(Boolean) ?? []

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devHost = parseHost(env.DEV_HOST)
  const previewHost = parseHost(env.PREVIEW_HOST)
  const devPort = parsePort(env.DEV_PORT, 5173)
  const previewPort = parsePort(env.PREVIEW_PORT, 4173)
  const devAllowedHosts = parseAllowedHosts(env.DEV_ALLOWED_HOSTS)
  const previewAllowedHosts = parseAllowedHosts(env.PREVIEW_ALLOWED_HOSTS)

  return {
    plugins: [react(), tailwindcss()],
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
    server: {
      host: devHost,
      port: devPort,
      strictPort: Boolean(env.DEV_PORT),
      ...(devAllowedHosts.length > 0 ? { allowedHosts: devAllowedHosts } : {}),
    },
    preview: {
      host: previewHost,
      port: previewPort,
      strictPort: Boolean(env.PREVIEW_PORT),
      ...(previewAllowedHosts.length > 0 ? { allowedHosts: previewAllowedHosts } : {}),
    },
  }
})
