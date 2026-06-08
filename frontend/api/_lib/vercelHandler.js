import app from './app.js'

function buildUrl(rawUrl) {
  try {
    return new URL(rawUrl ?? '/', 'http://localhost')
  } catch {
    return new URL('/', 'http://localhost')
  }
}

function ensureApiPath(pathname) {
  const cleanPath = String(pathname ?? '').trim()

  if (!cleanPath || cleanPath === '/') {
    return '/api'
  }

  if (cleanPath.startsWith('/api')) {
    return cleanPath
  }

  return `/api${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`
}

function getRewrittenPath(request) {
  const pathFromQuery = request?.query?.path ?? request?.query?.target

  if (Array.isArray(pathFromQuery)) {
    return pathFromQuery.join('/')
  }

  if (typeof pathFromQuery === 'string') {
    return pathFromQuery
  }

  const requestUrl = buildUrl(request?.url)
  return requestUrl.searchParams.get('path') ?? requestUrl.searchParams.get('target') ?? ''
}

function buildSearchString(request, keysToRemove = []) {
  const url = buildUrl(request?.url)

  for (const key of keysToRemove) {
    url.searchParams.delete(key)
  }

  const search = url.searchParams.toString()
  return search ? `?${search}` : ''
}

export function resolveOriginalApiPath(request) {
  return ensureApiPath(buildUrl(request?.url).pathname)
}

export function resolveRewrittenApiPath(request) {
  return ensureApiPath(getRewrittenPath(request))
}

export function createVercelHandler(resolvePath, options = {}) {
  const { removeQueryKeys = [] } = options

  return function handler(request, response) {
    const pathname = typeof resolvePath === 'function' ? resolvePath(request) : resolvePath
    request.url = `${ensureApiPath(pathname)}${buildSearchString(request, removeQueryKeys)}`
    return app(request, response)
  }
}
