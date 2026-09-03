import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Build every existing HTML page so /career/*.html also works in dist.
export default defineConfig({
  appType: 'mpa',
  build: {
    rolldownOptions: {
      input: Object.fromEntries([
        'index.html',
        'career/jobs.html',
        'career/companies.html',
        'career/resume.html',
        'career/interview.html',
        'career/apply.html',
        'career/cases.html',
      ].map(file => [file, resolve(import.meta.dirname, file)])),
    },
  },
});
