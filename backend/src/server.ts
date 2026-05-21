import http from 'node:http'
import { app } from './app'

const PORT = 4000;
const server = http.createServer(app)

server.listen(PORT, ()=>{
    console.log(`Backend listening on http://localhost:${PORT}`);
})