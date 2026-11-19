import http from 'node:http'

const port = Number(process.env.PORT || 3000)

const server = http.createServer((request, response) => {
  if (request.url === '/api/health' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      status: 'ok',
      service: 'veggiedelight-backend',
      environment: process.env.APP_ENVIRONMENT || 'development',
    }))
    return
  }

  response.writeHead(404, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(port, '0.0.0.0', () => {
  console.log(`VeggieDelight backend listening on port ${port}`)
})
