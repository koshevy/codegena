export type TypographySectionVariant = (
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline'
  | 'codegenaMessage'
  | 'codegenaRichTextToolbarMenu'
);

export type TypographySectionItem = {
  label: string;
  sample: string;
  variant: TypographySectionVariant;
};

export const typographySectionItems: TypographySectionItem[] = [
  { variant: 'h1', label: 'Heading 1', sample: 'Golos Text Display' },
  { variant: 'h2', label: 'Heading 2', sample: 'Pastel Messenger Palette' },
  { variant: 'h3', label: 'Heading 3', sample: 'Communications Interface' },
  { variant: 'h4', label: 'Heading 4', sample: 'Editor Surfaces' },
  { variant: 'h5', label: 'Heading 5', sample: 'Toolbar Controls' },
  { variant: 'h6', label: 'Heading 6', sample: 'Menu Navigation' },
  {
    variant: 'subtitle1',
    label: 'Subtitle 1',
    sample: 'Structured content hierarchy',
  },
  {
    variant: 'subtitle2',
    label: 'Subtitle 2',
    sample: 'Emphasized supporting text',
  },
  {
    variant: 'body1',
    label: 'Body 1',
    sample: 'Primary reading text for long-form content and messages.',
  },
  {
    variant: 'body2',
    label: 'Body 2',
    sample: 'Secondary body copy for compact UI areas.',
  },
  { variant: 'button', label: 'Button', sample: 'Call to action' },
  {
    variant: 'caption',
    label: 'Caption',
    sample: 'Metadata and helper labels',
  },
  { variant: 'overline', label: 'Overline', sample: 'SECTION LABEL' },
  {
    variant: 'codegenaMessage',
    label: 'Codegena Message',
    sample:
      'Chat message with preserved line breaks\nand comfortable reading rhythm.',
  },
  {
    variant: 'codegenaRichTextToolbarMenu',
    label: 'Codegena Toolbar Menu',
    sample: 'Rich text toolbar menu item',
  },
];
