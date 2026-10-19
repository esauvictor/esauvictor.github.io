// Builds sitemap.xml from the live API: main pages, every open/closed/completed class and every published post.
const API = 'https://esauvictor.name.ng/api';
const SITE = 'https://esauvictor.name.ng';
const get = async (path) => { const r = await fetch(API + path, { headers: { accept: 'application/json' } }); if (!r.ok) throw new Error(path + ' ' + r.status); return r.json(); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urls = [['/', 1.0], ['/classes', 0.9], ['/blog', 0.8], ['/Gym', 0.5], ['/aivvis-bakery', 0.5], ['/iauesa', 0.5], ['/restaurant', 0.5], ['/privacy', 0.3]];
try { const d = await get('/classes.php'); for (const c of d.classes || []) urls.push(['/class?c=' + encodeURIComponent(c.slug), 0.9]); } catch (e) { console.error('classes:', e.message); }
try { const d = await get('/posts.php'); for (const p of (d.posts || d.items || [])) if (p.slug) urls.push(['/post?slug=' + encodeURIComponent(p.slug), 0.6]); } catch (e) { console.error('posts:', e.message); }
if (urls.length < 12) { console.error('Too few URLs; keeping the old sitemap.'); process.exit(0); }
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(([u, pr]) => `  <url><loc>${esc(SITE + u)}</loc><priority>${pr}</priority></url>`).join('\n') + '\n</urlset>\n';
(await import('node:fs')).writeFileSync('sitemap.xml', xml);
console.log('Wrote', urls.length, 'URLs');
