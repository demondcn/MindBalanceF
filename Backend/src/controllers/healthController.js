export function getHealth(request, response) {
  response.json({
    ok: true,
    service: 'MindBalance API',
  })
}
