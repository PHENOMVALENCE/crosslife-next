import fs from 'fs';
import path from 'path';

const src = path.join('C:', 'xampp', 'htdocs', 'crosslife', 'index.html');
const out = path.join('C:', 'xampp', 'htdocs', 'crosslife-next', 'src', 'components', 'public', 'home', 'home-content.html');

const html = fs.readFileSync(src, 'utf8');
const match = html.match(/<main class="main">([\s\S]*?)<\/main>/);
if (!match) throw new Error('Main content not found');

let content = match[1];
content = content
  .replace(/assets\//g, '/assets/')
  .replace(/href="index\.html/g, 'href="/')
  .replace(/href="index\.html#/g, 'href="/#')
  .replace(/href="leadership\.php"/g, 'href="/leadership"')
  .replace(/href="ministries\.php"/g, 'href="/ministries"')
  .replace(/href="sermons\.php"/g, 'href="/sermons"')
  .replace(/href="discipleship\.html"/g, 'href="/discipleship"')
  .replace(/href="events\.php"/g, 'href="/events"')
  .replace(/href="contacts\.html"/g, 'href="/contact"')
  .replace(/href="galley\.html"/g, 'href="/gallery"')
  .replace(/action="forms\/feedback\.php"/g, 'data-form="feedback"')
  .replace(/action="forms\/newsletter\.php"/g, 'data-form="newsletter"')
  .replace(/action="forms\/contact\.php"/g, 'data-form="contact"')
  .replace(/action="forms\/prayer-request\.php"/g, 'data-form="prayer"');

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, content.trim());
console.log('Home content extracted to', out);
