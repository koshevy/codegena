import type { MouseEventHandler, ReactNode } from 'react';

interface HeaderIconButtonBaseProps {
  icon: ReactNode;
  label: string;
}

interface HeaderIconLinkProps extends HeaderIconButtonBaseProps {
  expanded?: never;
  href: string;
  onClick?: never;
  target?: '_blank' | '_self';
}

interface HeaderIconActionProps extends HeaderIconButtonBaseProps {
  expanded?: boolean;
  href?: never;
  onClick: MouseEventHandler<HTMLButtonElement>;
  target?: never;
}

export type HeaderIconButtonProps = HeaderIconLinkProps | HeaderIconActionProps;
