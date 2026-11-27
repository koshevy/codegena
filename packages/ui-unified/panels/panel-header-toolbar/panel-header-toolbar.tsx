import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { type MouseEvent, type ReactElement, type ReactNode, useCallback } from 'react';

import { PanelHeaderToolbarItemStyles } from './panel-header-toolbar.styles';

export interface PanelHeaderToolbarOption<TValue extends string> {
  ariaLabel?: string;
  icon: ReactNode;
  title: ReactNode;
  value: TValue;
}

export interface PanelHeaderToolbarProps<TValue extends string> {
  ariaLabel: string;
  onChange: (value: TValue) => void;
  options: readonly PanelHeaderToolbarOption<TValue>[];
  value: TValue;
}

export function PanelHeaderToolbar<TValue extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: PanelHeaderToolbarProps<TValue>): ReactElement {
  const handleChange = useCallback((
    _event: MouseEvent<HTMLElement>,
    nextValue: TValue | null,
  ): void => {
    if (nextValue === null) {
      return;
    }

    onChange(nextValue);
  }, [onChange]);

  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      exclusive
      onChange={handleChange}
      size="small"
      value={value}
    >
      {options.map((option) => {
        const optionAriaLabel = option.ariaLabel ?? (
          typeof option.title === 'string' ? option.title : option.value
        );

        return (
          <Tooltip
            key={option.value}
            title={option.title}
          >
            <PanelHeaderToolbarItemStyles
              aria-label={optionAriaLabel}
              value={option.value}
            >
              <span>{option.icon}</span>
            </PanelHeaderToolbarItemStyles>
          </Tooltip>
        );
      })}
    </ToggleButtonGroup>
  );
}
