import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

// Server-renders the one page and asserts strings present at first render: copy-register strings the windows carry, Meera's story, the spec link and the footer.
const html = renderToString(
  <MemoryRouter initialEntries={['/']}>
    <App />
  </MemoryRouter>,
);
const checks = [
  'Bundle', 'Meera', 'Retirement planning', 'zugzwangworld', 'rename, edit, or hide',
  'Bundle chats', 'Finding related chats…', 'Claude couldn’t bundle your chats. Your list is unchanged.', 'Bundle_ZW-FS-001_v1_0.pdf',
];
for (const c of checks) {
  if (!html.includes(c)) throw new Error(`[/] missing: ${c}`);
}
if (html.includes('/prototype')) throw new Error('[/] links to /prototype, which no longer exists');
console.log(`/ OK — ${html.length} bytes`);
console.log('smoke passed');
