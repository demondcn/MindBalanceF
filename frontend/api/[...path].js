import app from './_lib/app.js'

export default function handler(request, response) {
  if (typeof request.url === 'string' && !request.url.startsWith('/api')) {
    request.url = `/api${request.url.startsWith('/') ? '' : '/'}${request.url}`
  }

  return app(request, response)
}
