import { https } from 'follow-redirects';
import { createWriteStream } from 'fs';
import decompress from 'decompress';

export async function download(url: string, file: string): Promise<string> {
  return await new Promise((resolve) => {
    https.get(url, (response) => {
      const stream = createWriteStream(file);
      response.pipe(stream);
      response.on('end', () => {
        stream.close();
        resolve(file);
      });
    });
  });
}

export async function extract(file: string, dir: string): Promise<void> {
  await decompress(file, dir);
}
