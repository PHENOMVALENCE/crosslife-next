import fs from 'fs';
import path from 'path';

const root = path.join('C:', 'xampp', 'htdocs');
const pages = [
  { src: 'crosslife/contacts.html', out: 'crosslife-next/src/components/public/contact/contact-content.html' },
  { src: 'crosslife/discipleship.html', out: 'crosslife-next/src/components/public/discipleship/discipleship-content.html' },
];

function transform(content) {
  return content
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
    .replace(/href="student\/login\.php"/g, 'href="/student/login"')
    .replace(/href="student\/register\.php"/g, 'href="/student/register"')
    .replace(/action="forms\/contact\.php"/g, 'data-form="contact"')
    .replace(/action="forms\/prayer-request\.php"/g, 'data-form="prayer-request"')
    .replace(/action="forms\/feedback\.php"/g, 'data-form="feedback"')
    .replace(/action="forms\/newsletter\.php"/g, 'data-form="newsletter"');
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page.src), 'utf8');
  const match = html.match(/<main class="main">([\s\S]*?)<\/main>/);
  if (!match) {
    console.error('No main in', page.src);
    continue;
  }
  const outPath = path.join(root, page.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, transform(match[1].trim()));
  console.log('Extracted', page.out);
}
