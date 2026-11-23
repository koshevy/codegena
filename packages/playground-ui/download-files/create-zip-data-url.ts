import { strToU8, zip } from 'fflate';

export interface DownloadableFile {
  fileName: string;
  text: string;
}

export async function createZipDataUrl(files: DownloadableFile[]): Promise<string> {
  const entries = Object.fromEntries(files.map(({ fileName, text }) => [
    fileName,
    strToU8(text),
  ]));

  const archive = await new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
    zip(entries, (error, data) => {
      if (error) {
        reject(error);

        return;
      }

      resolve(data);
    });
  });

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);

        return;
      }

      reject(new Error('Could not read the ZIP archive.'));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Could not read the ZIP archive.'));
    };
    reader.readAsDataURL(new Blob([archive], { type: 'application/zip' }));
  });
}
