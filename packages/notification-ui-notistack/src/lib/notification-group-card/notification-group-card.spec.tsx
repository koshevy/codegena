import { fireEvent, render, screen } from '@testing-library/react';

import { NotificationGroupCard } from './notification-group-card';

describe('NotificationGroupCard', () => {
  it('renders supplied messages and invokes presentation callbacks', () => {
    const onClose = jest.fn();
    const onDismissGrouped = jest.fn();

    render(
      <NotificationGroupCard
        notifications={[{
          actionGrip: { close: onClose, closeAll: jest.fn() },
          id: 'grouped-message',
          message: { fallbackMessage: 'Schema needs review' },
          onClose,
        }]}
        onDismissGrouped={onDismissGrouped}
      />,
    );

    expect(screen.getByText('1 more notification')).not.toBeNull();
    expect(screen.queryByText('Schema needs review')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));

    expect(screen.getByText('Schema needs review')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss grouped' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDismissGrouped).toHaveBeenCalledTimes(1);
  });
});
