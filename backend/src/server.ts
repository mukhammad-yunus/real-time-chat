import http from 'node:http'
import { app } from './app'
import { env } from './config/env';

const {PORT} = env;
const server = http.createServer(app)

server.listen(PORT, ()=>{
    console.log(`Backend listening on http://localhost:${PORT}`);
})

function shutdown(signal: string) {
  console.log(`${signal} received. Closing HTTP server.`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));