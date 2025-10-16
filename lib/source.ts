import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-core/mdx';
import { icons } from 'lucide-react';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource({
    contentPath: './content/docs',
  }),
});

export const { getPage, getPages, pageTree } = source;
