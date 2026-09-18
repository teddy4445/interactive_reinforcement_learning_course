import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Developer-only audit: never included in the static application.
const manifest = JSON.parse(await readFile('reference/course-manifest.json', 'utf8'));
const root = 'https://raw.githubusercontent.com/teddy4445/applied_computational_mathematics_lab_website/main/';
const sources = [
  ['acml-home', 'https://acml.teddylazebnik.com/'],
  ['acml-index', `${root}index.html`],
  ['acml-main', `${root}js/main.js`],
  ['acml-styles', `${root}css/styles.css`],
  ['acml-license', `${root}LICENSE`],
  ...manifest.lessons.map((lesson) => [`lesson-${lesson.id}`, lesson.source.slideUrl]),
];
await mkdir('evidence/task-00-01', { recursive: true });
await mkdir('.local/references', { recursive: true });
const records = [];
for (const [id, url] of sources) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    const pdf = bytes.subarray(0, 5).toString() === '%PDF-';
    const record = { id, url, status: response.status, contentType: response.headers.get('content-type'), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), pdfRetrieved: pdf };
    records.push(record);
    if (response.ok && (!id.startsWith('lesson-') || pdf)) await writeFile(`.local/references/${id}.${pdf ? 'pdf' : 'txt'}`, bytes);
    console.log(`${id}: HTTP ${response.status}, ${bytes.length} bytes${id.startsWith('lesson-') ? `, PDF ${pdf}` : ''}`);
  } catch (error) {
    records.push({ id, url, error: error.message, code: error.cause?.code ?? null });
    console.log(`${id}: ${error.message}`);
  }
}
await writeFile('evidence/task-00-01/reference-fetch.json', JSON.stringify({ checkedAt: new Date().toISOString(), records }, null, 2) + '\n');
