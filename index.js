/* eslint-disable @typescript-eslint/no-var-requires */
// https://stackoverflow.com/a/63602976/470749

// usage: localhost:8080?url=https://baidu.com

const express = require('express')
require('dotenv').config()

const app = express()
const https = require('https')
const http = require('http')
var url = require('url')

// const { response } = require('express');

// let targetUrl = process.env.TARGET_URL || 'https://jsonplaceholder.typicode.com' // Run localtunnel like `lt -s rscraper -p 8080 --print-requests`; then visit https://yourname.loca.lt/todos/1 .

const proxyServerPort = process.env.PROXY_SERVER_PORT || 8080

// eslint-disable-next-line max-lines-per-function
app.use('/', function (clientRequest, clientResponse) {
  console.log(19, clientRequest.url.query)

  let queryData = url.parse(clientRequest.url, true).query
  console.log(22, queryData.url)

  let targetUrl = queryData.url

  const parsedHost = targetUrl.split('/').splice(2).splice(0, 1).join('/')
  let parsedPort
  let parsedSSL
  if (targetUrl.startsWith('https://')) {
    parsedPort = 443
    parsedSSL = https
  } else if (targetUrl.startsWith('http://')) {
    parsedPort = 80
    parsedSSL = http
  }
  const options = {
    hostname: parsedHost,
    port: parsedPort,
    path: clientRequest.url,
    method: clientRequest.method,
    headers: {
      'User-Agent': clientRequest.headers['user-agent'],
    },
  }

  const serverRequest = parsedSSL.request(options, function (serverResponse) {
    let body = ''
    if (
      String(serverResponse.headers['content-type']).indexOf('text/html') !== -1
    ) {
      serverResponse.on('data', function (chunk) {
        body += chunk
      })

      serverResponse.on('end', function () {
        // Make changes to HTML files when they're done being read.
        // body = body.replace(`example`, `Cat!`);

        clientResponse.writeHead(
          serverResponse.statusCode,
          serverResponse.headers
        )
        clientResponse.end(body)
      })
    } else {
      serverResponse.pipe(clientResponse, {
        end: true,
      })
      clientResponse.contentType(serverResponse.headers['content-type'])
    }
  })

  serverRequest.end()
})

app.listen(8080)
console.log(`Proxy server listening on port ${proxyServerPort}`)
