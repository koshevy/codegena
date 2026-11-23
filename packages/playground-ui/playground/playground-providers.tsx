import {
  SearchSuggestionsSourceProvider,
  type SearchSuggestionsSource,
} from '@codegena/graph-search-ui';
import type { Theme } from '@mui/material/styles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import type { ComponentType, ReactNode } from 'react';

interface PlaygroundProvidersProps {
  children: ReactNode;
  notificationProvider?: ComponentType<{ children: ReactNode }>;
  searchGetVersion: () => number;
  searchSource?: SearchSuggestionsSource;
  searchSubscribe: (listener: () => void) => () => void;
  theme?: Theme;
}

export function PlaygroundProviders({
  children,
  notificationProvider: NotificationProvider,
  searchGetVersion,
  searchSource,
  searchSubscribe,
  theme,
}: PlaygroundProvidersProps): ReactNode {
  const renderedSearchProvider = searchSource && (
    <SearchSuggestionsSourceProvider
      getVersion={searchGetVersion}
      source={searchSource}
      subscribe={searchSubscribe}
    >
      {children}
    </SearchSuggestionsSourceProvider>
  );

  const renderedContentWithSearch = renderedSearchProvider || children;

  const renderedContentWithNotifications = NotificationProvider
    ? <NotificationProvider>{renderedContentWithSearch}</NotificationProvider>
    : renderedContentWithSearch;

  if (!theme) {
    return renderedContentWithNotifications;
  }

  return <ThemeProvider theme={theme}>{renderedContentWithNotifications}</ThemeProvider>;
}
