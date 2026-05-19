import { createServer } from 'vite';

const modules = [
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/components/Layout.tsx',
  '/src/pages/Login.tsx',
  '/src/pages/Dashboard.tsx',
  '/src/i18n/index.ts',
  '/src/store/auth.ts',
  '/src/api/index.ts',
];

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
});

console.log('Checking module transforms...\n');
for (const mod of modules) {
  try {
    const result = await server.transformRequest(mod);
    if (result) {
      console.log(`✅ ${mod} (${result.code.length} chars)`);
    } else {
      console.log(`⚠️  ${mod} - null result`);
    }
  } catch (e) {
    console.error(`❌ ${mod}:`, e.message);
  }
}

await server.close();
