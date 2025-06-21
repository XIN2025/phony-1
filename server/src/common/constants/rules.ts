import { readFileSync } from 'fs';

export const rules = {
  'next-nest': () => readFileSync('src/templates/docs/next-nest.md', 'utf-8'),
  nextjs: () => readFileSync('src/templates/docs/nextjs.md', 'utf-8'),
  remix: () => readFileSync('src/templates/docs/remix.md', 'utf-8'),
  common: () => readFileSync('src/templates/docs/common.md', 'utf-8'),
  'next-fastapi': () =>
    readFileSync('src/templates/docs/next-fastapi.md', 'utf-8'),
  'react-native': () =>
    readFileSync('src/templates/docs/react-native.md', 'utf-8'),
};

export const integrationDocs = {
  stripe: () => {
    const template = readFileSync('src/templates/docs/stripe.md', 'utf-8');
    return template;
  },
};
