/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';

import { usePlaygroundKeyboard } from './use-playground-keyboard';

function OverlayKeyboardExample({ onClose }: {
  onClose: () => void;
}): ReactElement {
  const handleKeyDown = usePlaygroundKeyboard(onClose);

  const renderedPopup = createPortal(<button>Nested popup</button>, document.body);

  return (
    <div
      aria-label="Keyboard example"
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={-1}
    >
      <button>Overlay control</button>
      {renderedPopup}
    </div>
  );
}

it('closes for its own Escape key but ignores events from a portaled popup', () => {
  const handleClose = jest.fn();

  render(<OverlayKeyboardExample onClose={handleClose} />);

  fireEvent.keyDown(screen.getByRole('button', { name: 'Nested popup' }), {
    key: 'Escape',
  });
  expect(handleClose).not.toHaveBeenCalled();

  fireEvent.keyDown(screen.getByRole('button', { name: 'Overlay control' }), {
    key: 'Escape',
  });
  expect(handleClose).toHaveBeenCalledTimes(1);
});
