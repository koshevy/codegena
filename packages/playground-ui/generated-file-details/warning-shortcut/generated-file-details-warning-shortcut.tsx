import { BottomFloatingButton } from '@codegena/ui-unified/panels';
import { TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';

interface GeneratedFileDetailsWarningShortcutProps {
  isWindowScroll: boolean;
  onClick: () => void;
}

export function GeneratedFileDetailsWarningShortcut({
  isWindowScroll,
  onClick,
}: GeneratedFileDetailsWarningShortcutProps): ReactElement {
  return (
    <BottomFloatingButton
      ariaLabel="Scroll to warnings in generated file details"
      color="warning"
      icon={(
        <TriangleAlert
          aria-hidden
          size={15}
        />
      )}
      label="Has warnings"
      onClick={onClick}
      position={isWindowScroll ? 'fixed' : 'absolute'}
    />
  );
}
