export interface BrowserTestServer {
  close: () => Promise<void>;
  updateWorker: () => void;
  url: string;
}
