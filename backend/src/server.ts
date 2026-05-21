import http from 'node:http'
import { app } from './app'
import { env } from './config/env';

const {PORT} = env;
const server = http.createServer(app)

server.listen(PORT, ()=>{
    console.log(`Backend listening on http://localhost:${PORT}`);
})