import Button from '@mui/material/Button';
import type { Meta, StoryObj } from '@storybook/react';
import { Eye, TriangleAlert } from 'lucide-react';
import { type MouseEvent, type ReactElement, useCallback, useState } from 'react';

import { ContextMenu } from './context-menu';

const meta: Meta<typeof ContextMenu> = {
  component: ContextMenu,
  title: 'Codegena/Unified UI/Menus/Context Menu',
};

export default meta;

function doNothing(): void {
  // Visual story only.
}

function ContextMenuExample({
  header,
  placement = 'anchor',
}: {
  header?: string;
  placement?: 'anchor' | 'position';
}): ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    if (placement === 'position') {
      setPosition({ left: event.clientX, top: event.clientY });
      return;
    }

    setAnchor(event.currentTarget);
  }, [placement]);

  const handleClose = useCallback((): void => {
    setAnchor(null);
    setPosition(null);
  }, []);

  const menuPlacement = placement === 'position'
    ? { position }
    : { anchor };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outlined"
      >
        Open menu
      </Button>
      <ContextMenu
        {...menuPlacement}
        ariaLabel="Example actions"
        header={header}
        items={[
          {
            icon: <Eye />,
            id: 'show',
            label: 'Reveal details',
            onSelect: doNothing,
          },
          {
            disabled: true,
            icon: <TriangleAlert />,
            id: 'warnings',
            label: 'Reveal warnings',
            onSelect: doNothing,
          },
        ]}
        onClose={handleClose}
      />
    </>
  );
}

export const WithHeader: StoryObj<typeof ContextMenu> = {
  render: () => <ContextMenuExample header="Generated declarations" />,
};

export const WithoutHeader: StoryObj<typeof ContextMenu> = {
  render: () => <ContextMenuExample />,
};

export const AtPointerPosition: StoryObj<typeof ContextMenu> = {
  render: () => <ContextMenuExample placement="position" />,
};
