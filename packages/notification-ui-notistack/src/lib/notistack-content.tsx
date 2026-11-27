import { SnackbarContent, type CustomContentProps } from 'notistack';
import { forwardRef } from 'react';

export const NotistackContent = forwardRef<HTMLDivElement, CustomContentProps>(
  ({ message, style }, ref) => (
    <SnackbarContent
      ref={ref}
      role="alert"
      style={style}
    >
      {message}
    </SnackbarContent>
  ),
);

NotistackContent.displayName = 'NotistackContent';
