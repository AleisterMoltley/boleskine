import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 8080;

const app = express();
app.disable('x-powered-by');

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, game: 'boleskine' });
});

app.use(
  express.static(dist, {
    maxAge: '7d',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

app.get('*', (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Boleskine listening on :${port}`);
});
