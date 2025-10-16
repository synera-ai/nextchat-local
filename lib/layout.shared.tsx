import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'NextChat Documentation',
      url: '/',
    },
    sidebar: {
      defaultOpenLevel: 1,
    },
    footer: {
      text: 'NextChat Documentation System - Built with Fumadocs',
    },
    search: {
      provider: 'local',
    },
  };
}
