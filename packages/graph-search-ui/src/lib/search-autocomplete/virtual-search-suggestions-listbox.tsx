import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
  useCallback,
  useRef,
} from 'react';

type SuggestionRow = ReactElement<HTMLAttributes<HTMLLIElement> & {
  'data-index'?: number;
  'data-option-index'?: number;
  'data-suggestion-kind'?: string;
  'data-suggestion-label'?: string;
  'ref'?: Ref<HTMLLIElement>;
}>;

function isSuggestionRow(value: unknown): value is SuggestionRow {
  return isValidElement(value) && value.type === 'li';
}

export const VirtualSearchSuggestionsListbox = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLElement>
>(function VirtualSearchSuggestionsListboxInner({ children, ...props }, forwardedRef) {
  const rows = Children.toArray(children).filter(isSuggestionRow);
  const listboxRef = useRef<HTMLUListElement>(null);

  const setListboxRef = useCallback((element: HTMLUListElement | null): void => {
    listboxRef.current = element;

    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    }
    else if (forwardedRef) {
      (forwardedRef as Ref<HTMLUListElement> & { current: HTMLUListElement | null })
        .current = element;
    }
  }, [forwardedRef]);

  const getScrollElement = useCallback((): HTMLUListElement | null => (
    listboxRef.current
  ), []);

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: (index) => {
      const row = rows[index];
      const optionHeight = row?.props['data-suggestion-kind'] === 'directory'
        ? 64
        : 116;

      return row?.props.role === 'presentation' ? 36 : optionHeight;
    },
    getScrollElement,
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const firstVisibleIndex = virtualItems[0]?.index ?? 0;
  const lastVisibleIndex = virtualItems.at(-1)?.index ?? 0;
  const renderedRows = rows.map((row, index) => {
    const isRendered = row.props.role === 'presentation'
      || (index >= firstVisibleIndex && index <= lastVisibleIndex);
    const placeholderHeight = virtualizer.measurementsCache[index]?.size
      ?? virtualizer.options.estimateSize(index);
    const rowStyle = isRendered
      ? row.props.style
      : { ...row.props.style, height: placeholderHeight };

    return cloneElement(row, {
      'aria-label': isRendered
        ? row.props['aria-label']
        : row.props['data-suggestion-label'],
      'children': isRendered ? row.props.children : null,
      'data-index': index,
      'ref': isRendered ? virtualizer.measureElement : null,
      'style': rowStyle,
    });
  });

  return (
    <ul
      {...props}
      ref={setListboxRef}
      style={props.style}
    >
      {renderedRows}
    </ul>
  );
});
