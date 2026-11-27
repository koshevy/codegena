import type { ReactElement } from 'react';
import type { LoadingComponentProps } from 'react-loadable';

export function ArticleLoading({ error }: LoadingComponentProps): ReactElement {
  const message = error instanceof Error ? error.message : 'Loading article';

  return <p>{message}</p>;
}
