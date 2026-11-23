import { type AnchorHTMLAttributes, type ReactElement, useCallback } from 'react';
import { useLinkClickHandler } from 'react-router-dom';

/**
 * Keep internal page links in the host router; preserve native hash and external links.
 */
export function HostLink({
  children,
  href = '#',
  onClick,
  target,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>): ReactElement {
  const navigate = useLinkClickHandler<HTMLAnchorElement>(href, { target });
  const isHostPath = href.startsWith('/');

  const handleClick = useCallback<NonNullable<typeof onClick>>((event): void => {
    onClick?.(event);

    const hasToNavigate = isHostPath && !event.defaultPrevented;

    if (hasToNavigate) {
      navigate(event);
    }
  }, [
    isHostPath,
    navigate,
    onClick,
  ]);

  return (
    <a
      {...props}
      href={href}
      onClick={handleClick}
      target={target}
    >
      {children}
    </a>
  );
}
