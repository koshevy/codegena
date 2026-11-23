import {
  type ChangeEvent,
  type RefObject,
  type SyntheticEvent,
  type UIEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

interface HighlightEditorInput {
  activeLine: number;
  handleChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleScroll: (event: UIEvent<HTMLTextAreaElement>) => void;
  handleSelect: (event: SyntheticEvent<HTMLTextAreaElement>) => void;
  source: string;
  viewportRef: RefObject<HTMLPreElement | null>;
}

export function useHighlightEditorInput(
  value: string | undefined,
  defaultValue: string | undefined,
): HighlightEditorInput {
  const [draft, setDraft] = useState(() => ({
    original: value,
    source: value ?? defaultValue ?? '',
  }));
  const [activeLine, setActiveLine] = useState(1);
  const viewportRef = useRef<HTMLPreElement>(null);

  // A new value from the caller replaces the draft without remounting the input.
  if (draft.original !== value) {
    setDraft({ original: value, source: value ?? defaultValue ?? '' });
  }

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>): void => {
    setDraft({ original: value, source: event.currentTarget.value });
  }, [value]);

  const handleScroll = useCallback((event: UIEvent<HTMLTextAreaElement>): void => {
    const {
      scrollLeft,
      scrollTop,
    } = event.currentTarget;

    viewportRef.current?.scrollTo({ left: scrollLeft, top: scrollTop });
  }, []);

  const handleSelect = useCallback((event: SyntheticEvent<HTMLTextAreaElement>): void => {
    const {
      selectionDirection,
      selectionEnd,
      selectionStart,
      value: source,
    } = event.currentTarget;
    const caret = selectionDirection === 'backward' ? selectionStart : selectionEnd;
    const precedingLines = source.slice(0, caret).match(/\n/g)?.length ?? 0;

    setActiveLine(precedingLines + 1);
  }, []);

  return {
    activeLine,
    handleChange,
    handleScroll,
    handleSelect,
    source: draft.source.replaceAll(/\r\n?/g, '\n'),
    viewportRef,
  };
}
