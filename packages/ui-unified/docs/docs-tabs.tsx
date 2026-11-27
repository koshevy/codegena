import Tab from '@mui/material/Tab';
import {
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useId,
  useState,
} from 'react';

import { DocsTabPanelStyles, DocsTabsStyles } from './docs-tabs.styles';

export interface DocsTab {
  content: ReactNode;
  label: string;
  value: string;
}

export interface DocsTabsProps {
  ariaLabel: string;
  items: readonly [DocsTab, ...DocsTab[]];
}

export function DocsTabs({ ariaLabel, items }: DocsTabsProps): ReactElement {
  const id = useId();
  const [requestedValue, setRequestedValue] = useState(items[0].value);
  const selectedItem = items.find(({ value }) => value === requestedValue) ?? items[0];

  const handleChange = useCallback((_event: SyntheticEvent, value: string): void => {
    setRequestedValue(value);
  }, []);

  return (
    <div>
      <DocsTabsStyles
        aria-label={ariaLabel}
        onChange={handleChange}
        selectionFollowsFocus
        value={selectedItem.value}
        variant="scrollable"
      >
        {items.map(({ label, value }) => (
          <Tab
            aria-controls={`${id}-panel-${value}`}
            id={`${id}-tab-${value}`}
            key={value}
            label={label}
            value={value}
          />
        ))}
      </DocsTabsStyles>
      {items.map(({ content, value }) => (
        <DocsTabPanelStyles
          aria-labelledby={`${id}-tab-${value}`}
          hidden={selectedItem.value !== value}
          id={`${id}-panel-${value}`}
          key={value}
          role="tabpanel"
          tabIndex={0}
        >
          {content}
        </DocsTabPanelStyles>
      ))}
    </div>
  );
}
