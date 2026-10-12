import fs from 'fs';
import path from 'path';
import type { Plugin, ViteDevServer } from 'vite';

export function cmsLocalPlugin(): Plugin {
  return {
    name: 'vite-plugin-bxkp-cms',
    configureServer(server: ViteDevServer) {
      const rootDir = server.config.root || process.cwd();
      const dataSrcPath = path.resolve(rootDir, 'src/data/sites.json');
      const dataPublicPath = path.resolve(rootDir, 'public/data/sites.json');
      const indexPath = path.resolve(rootDir, 'index.html');
      const backupsDir = path.resolve(rootDir, '.cms-backups');

      if (!fs.existsSync(backupsDir)) {
        try {
          fs.mkdirSync(backupsDir, { recursive: true });
        } catch (e) {
          console.error('[CMS Plugin] Failed to create .cms-backups dir:', e);
        }
      }

      // Helper to parse JSON body
      const parseBody = (req: any): Promise<any> => {
        return new Promise((resolve, reject) => {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch (err) {
              reject(err);
            }
          });
          req.on('error', reject);
        });
      };

      // Helper to send JSON response
      const sendJson = (res: any, status: number, data: any) => {
        res.writeHead(status, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.end(JSON.stringify(data));
      };

      // Middleware router
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        const lowerUrl = url.toLowerCase();

        // 0. 直接拦截并提供 CMS 页面 (无论是否带尾随斜杠、无论大小写、无论是否带 /public 前缀)
        if (
          lowerUrl === '/donttouchmyshit' ||
          lowerUrl === '/donttouchmyshit/' ||
          lowerUrl === '/donttouchmyshit/index.html' ||
          lowerUrl === '/public/donttouchmyshit' ||
          lowerUrl === '/public/donttouchmyshit/' ||
          lowerUrl === '/public/donttouchmyshit/index.html'
        ) {
          const cmsHtmlPath = path.resolve(rootDir, 'public/Donttouchmyshit/index.html');
          if (fs.existsSync(cmsHtmlPath)) {
            res.writeHead(200, {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            });
            return fs.createReadStream(cmsHtmlPath).pipe(res);
          }
        }

        // 1. GET /api/cms/data
        if (req.method === 'GET' && url === '/api/cms/data') {
          try {
            const targetFile = fs.existsSync(dataSrcPath) ? dataSrcPath : dataPublicPath;
            if (fs.existsSync(targetFile)) {
              const content = fs.readFileSync(targetFile, 'utf-8');
              const data = JSON.parse(content);
              return sendJson(res, 200, { success: true, data });
            } else {
              return sendJson(res, 404, { success: false, error: 'Data file not found' });
            }
          } catch (e: any) {
            return sendJson(res, 500, { success: false, error: e.message });
          }
        }

        // 2. POST /api/cms/save
        if (req.method === 'POST' && url === '/api/cms/save') {
          try {
            const body = await parseBody(req);
            const { data, note } = body;

            if (!data) {
              return sendJson(res, 400, { success: false, error: 'Missing data payload' });
            }

            data.updatedAt = new Date().toISOString().split('T')[0];

            // 1. Backup current
            const now = new Date();
            const timeStr = now.toISOString().replace(/[:.]/g, '-');
            const backupFileName = `snapshot-${timeStr}.json`;
            const backupFilePath = path.join(backupsDir, backupFileName);

            const backupPayload = {
              createdAt: now.toISOString(),
              note: note || '自动保存快照',
              data
            };
            fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');

            // 2. Write src/data/sites.json & public/data/sites.json
            const jsonStr = JSON.stringify(data, null, 2) + '\n';
            fs.writeFileSync(dataSrcPath, jsonStr, 'utf-8');
            if (fs.existsSync(path.dirname(dataPublicPath))) {
              fs.writeFileSync(dataPublicPath, jsonStr, 'utf-8');
            }

            // 3. Update index.html SEO schema & noscript if present
            try {
              if (fs.existsSync(indexPath) && data.faqs && data.sites) {
                let html = fs.readFileSync(indexPath, 'utf-8');

                // Update FAQPage Schema.org
                const faqEntities = (data.faqs || []).map((f: any) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.answer
                  }
                }));

                const faqRegex = /"@type":\s*"FAQPage"[\s\S]*?"mainEntity":\s*\[[\s\S]*?\]\s*\}/;
                if (html.match(faqRegex)) {
                  const newFaqSchema = `"@type": "FAQPage",\n          "mainEntity": ${JSON.stringify(faqEntities, null, 12).replace(/\n\s*}/g, '\n          }')}`;
                  html = html.replace(faqRegex, newFaqSchema);
                }

                fs.writeFileSync(indexPath, html, 'utf-8');
              }
            } catch (err) {
              console.warn('[CMS Plugin] Failed to update index.html SEO tags:', err);
            }

            return sendJson(res, 200, {
              success: true,
              message: '全站数据已成功保存并同步！',
              backupId: backupFileName,
              updatedAt: data.updatedAt
            });
          } catch (e: any) {
            return sendJson(res, 500, { success: false, error: e.message });
          }
        }

        // 3. POST /api/cms/check-links
        if (req.method === 'POST' && url === '/api/cms/check-links') {
          try {
            const body = await parseBody(req);
            const urls: string[] = body.urls || [];

            const concurrency = 6;
            const results: Array<{
              url: string;
              ok: boolean;
              status: number;
              timeMs: number;
              error?: string;
            }> = [];

            const checkSingleUrl = async (targetUrl: string) => {
              const start = Date.now();
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6500);

                const response = await fetch(targetUrl, {
                  method: 'GET',
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 BXKP-HealthChecker/1.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                  },
                  signal: controller.signal,
                  redirect: 'follow'
                });
                clearTimeout(timeoutId);
                const elapsed = Date.now() - start;

                results.push({
                  url: targetUrl,
                  ok: response.status < 400,
                  status: response.status,
                  timeMs: elapsed
                });
              } catch (err: any) {
                const elapsed = Date.now() - start;
                const isTimeout = err.name === 'AbortError';
                results.push({
                  url: targetUrl,
                  ok: false,
                  status: isTimeout ? 408 : 0,
                  timeMs: elapsed,
                  error: isTimeout ? '请求超时 (>6.5s)' : (err.message || '连接失败')
                });
              }
            };

            // Run in pool of concurrent workers
            for (let i = 0; i < urls.length; i += concurrency) {
              const batch = urls.slice(i, i + concurrency);
              await Promise.all(batch.map(checkSingleUrl));
            }

            return sendJson(res, 200, { success: true, results });
          } catch (e: any) {
            return sendJson(res, 500, { success: false, error: e.message });
          }
        }

        // 4. GET /api/cms/backups
        if (req.method === 'GET' && url === '/api/cms/backups') {
          try {
            if (!fs.existsSync(backupsDir)) {
              return sendJson(res, 200, { success: true, backups: [] });
            }
            const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json'));
            const backups = files.map(filename => {
              const filePath = path.join(backupsDir, filename);
              const stat = fs.statSync(filePath);
              let note = '快照备份';
              try {
                const raw = fs.readFileSync(filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                if (parsed.note) note = parsed.note;
              } catch (e) {}

              return {
                id: filename,
                filename,
                size: stat.size,
                createdAt: stat.mtime.toLocaleString('zh-CN'),
                note
              };
            }).sort((a, b) => b.filename.localeCompare(a.filename));

            return sendJson(res, 200, { success: true, backups });
          } catch (e: any) {
            return sendJson(res, 500, { success: false, error: e.message });
          }
        }

        // 5. POST /api/cms/create-backup
        if (req.method === 'POST' && url === '/api/cms/create-backup') {
          try {
            const body = await parseBody(req);
            const note = body.note || '手动快照';
            const targetFile = fs.existsSync(dataSrcPath) ? dataSrcPath : dataPublicPath;
            if (!fs.existsSync(targetFile)) {
              return sendJson(res, 404, { success: false, error: 'Data file not found' });
            }

            const raw = fs.readFileSync(targetFile, 'utf-8');
            const data = JSON.parse(raw);
            const now = new Date();
            const timeStr = now.toISOString().replace(/[:.]/g, '-');
            const backupFileName = `manual-${timeStr}.json`;
            const backupFilePath = path.join(backupsDir, backupFileName);

            fs.writeFileSync(backupFilePath, JSON.stringify({
              createdAt: now.toISOString(),
              note,
              data
            }, null, 2), 'utf-8');

            return sendJson(res, 200, { success: true, backupId: backupFileName });
          } catch (e: any) {
            return sendJson(res, 500, { success: false, error: e.message });
          }
        }

        // 6. POST /api/cms/restore-backup
        if (req.method === 'POST' && url === '/api/cms/restore-backup') {
          try {
            const body = await parseBody(req);
            const backupId = body.backupId;
            if (!backupId) {
              return sendJson(res, 400, { success: false, error: 'Missing backupId' });
            }

            const backupFilePath = path.join(backupsDir, backupId);
            if (!fs.existsSync(backupFilePath)) {
              return sendJson(res, 404, { success: false, error: 'Backup file not found' });
            }

            const raw = fs.readFileSync(backupFilePath, 'utf-8');
            const parsed = JSON.parse(raw);
            const dataToRestore = parsed.data || parsed;

            const jsonStr = JSON.stringify(dataToRestore, null, 2) + '\n';
            fs.writeFileSync(dataSrcPath, jsonStr, 'utf-8');
            if (fs.existsSync(path.dirname(dataPublicPath))) {
              fs.writeFileSync(dataPublicPath, jsonStr, 'utf-8');
            }

            return sendJson(res, 200, { success: true, message: `已成功还原至快照 ${backupId}` });
          } catch (e: any) {
            return sendJson(res, 500, { success: false, error: e.message });
          }
        }

        next();
      });
    }
  };
}
