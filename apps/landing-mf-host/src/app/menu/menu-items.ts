import { GitHubInvertocatIcon } from '@codegena/ui-unified/icons';
import {
  BookOpen,
  HockeyStick,
  Info,
  Mail,
  Map,
  Newspaper,
  Waypoints,
} from 'lucide-react';

export const menuItems = [
  { href: '/docs', icon: BookOpen, label: 'Docs' },
  { href: '/docs/roadmap-and-status', icon: Map, label: 'Roadmap and status' },
  { href: '#ideology', icon: Waypoints, label: 'Ideology' },
  { href: '/docs/blog', icon: Newspaper, label: 'Blog' },
  { href: '/docs/about', icon: Info, label: 'About' },
  { href: '/docs/contacts', icon: Mail, label: 'Contacts' },
  {
    href: 'https://github.com/koshevy/codegena',
    icon: GitHubInvertocatIcon,
    label: 'GitHub',
  },
  { href: '/playground', icon: HockeyStick, label: 'Playground' },
] as const;

export const menuAction = { href: '/docs', label: 'Get started' } as const;

export const policyItems = [
  { href: '/docs/security', label: 'Security' },
  { href: '/docs/personal-data-privacy', label: 'Personal data privacy' },
] as const;
