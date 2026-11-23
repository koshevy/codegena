import { Boxes, KeyRound, PawPrint } from 'lucide-react';

import type { DemoOption } from './demo-option';

export const demoChoices: DemoOption[] = [
  {
    icon: PawPrint,
    label: 'Simplest pet store',
    specUrl: '/specifications/pet-store.json',
  },
  {
    icon: KeyRound,
    label: '1Password small API set (67 declarations)',
    showClickCue: true,
    specUrl: '/specifications/one-password.json',
  },
  {
    icon: Boxes,
    label: 'Edge case for GitHub (5000+ declarations)',
    specUrl: '/specifications/github.json',
  },
];
