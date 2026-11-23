import type {
  GraphPayload,
  GraphPayloadGroupNode,
  GraphPayloadItemNode,
} from '@codegena/graph-core';
import {
  useOptionalNotification,
  type NotifyOptions,
} from '@codegena/notification-ui-core';
import {
  createZipDataUrl,
  createZipFileName,
  downloadFromUrl,
} from '@codegena/playground-ui/download-files';
import { Download } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

const notificationOptions: NotifyOptions = {
  onClosed: () => { /* No lifecycle action is needed. */ },
  onShowingAnimationComplete: () => { /* No lifecycle action is needed. */ },
};

const minimumPendingDuration = 3000;

export function useDownloadAllArchive(graph: GraphPayload): {
  isPending: boolean;
  onDownload: () => void;
} {
  const notifications = useOptionalNotification();
  const cache = useRef<{
    graph: GraphPayload;
    fileName: string;
    url: string;
  } | null>(null);

  const [isPending, setIsPending] = useState(false);

  const onDownload = useCallback((): void => {
    if (isPending) {
      return;
    }

    const notifyFailure = (message: string): void => {
      notifications?.notify({
        fallbackMessage: message,
        severity: 'error',
      }, notificationOptions, 'ui');
    };

    if (cache.current?.graph === graph) {
      try {
        downloadFromUrl(cache.current.fileName, cache.current.url);
      }
      catch {
        notifyFailure('Could not download the ZIP archive.');
      }

      return;
    }

    const files = graph.nodes
      .filter((node): node is GraphPayloadGroupNode => (
        node.data.kind === 'group'
      ))
      .map(({ data }) => ({ fileName: data.fileName, text: data.text }));

    const sourceFileName = graph.nodes.find(
      (node): node is GraphPayloadItemNode => node.data.kind === 'item',
    )
      ?.data.sourceLocation.fileName
      ?? graph.logs[0]?.jsoncNode?.fileName
      ?? 'schema.json';
    const fileName = createZipFileName(sourceFileName);

    setIsPending(true);

    void Promise.all([
      createZipDataUrl(files),
      new Promise<void>((resolve) => setTimeout(resolve, minimumPendingDuration)),
    ]).then(([url]) => {
      cache.current = { graph, fileName, url };
      notifications?.notify({
        actions: [{
          icon: (
            <Download
              aria-hidden
              size={16}
            />
          ),
          onClick: () => {
            try {
              downloadFromUrl(fileName, url);
            }
            catch {
              notifyFailure('Could not download the ZIP archive.');
            }

            return 'close';
          },
          title: 'Download zip-file',
        }],
        autoHideDuration: 15_000,
        fallbackMessage: url,
        message: 'Archive is ready. You can download it.',
        severity: 'success',
      }, notificationOptions, 'ui');
    }).catch(() => {
      notifyFailure('Could not create the ZIP archive.');
    }).finally(() => setIsPending(false));
  }, [graph, isPending, notifications]);

  return { isPending, onDownload };
}
