import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';

export const source = loader({
  baseUrl: '/docs',
  source: {
    contentPath: './content/docs',
    meta: './content/docs/meta.json',
  },
});

export const { getPage, getPages, pageTree } = source;
