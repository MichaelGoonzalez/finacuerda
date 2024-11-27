import { createServer } from 'https';
import { parse } from 'url';
import * as fs from 'fs';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Cargar el certificado y la clave para HTTPS
const httpsOptions = {
  key: fs.readFileSync('./192.168.1.115-key.pem'),
  cert: fs.readFileSync('./192.168.1.115.pem'),
};

app.prepare().then(() => {
  // Inicia un servidor HTTPS
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, '192.168.1.115', (err) => {
    if (err) throw err;
    console.log('> Ready on https://192.168.1.115:3000');
  });
});
