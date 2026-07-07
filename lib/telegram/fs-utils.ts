import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
}

export async function writeFileAtomic(
  filename: string,
  data: string | Uint8Array
) {
  await ensureDirectory(path.dirname(filename));

  const temporary = `${filename}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporary, data);

  await fs.rm(filename, { force: true });
  await fs.rename(temporary, filename);
}

export async function removeEmptyDirectory(directory: string) {
  try {
    const entries = await fs.readdir(directory);
    if (entries.length === 0) {
      await fs.rmdir(directory);
    }
  } catch {
    // Directory does not exist or is not empty anymore.
  }
}

const locks = new Map<string, Promise<void>>();

export async function withFileLock<T>(key: string, action: () => Promise<T>) {
  const previous = locks.get(key) || Promise.resolve();

  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });

  const tail = previous.then(() => current);
  locks.set(key, tail);
  await previous;

  try {
    return await action();
  } finally {
    release();
    if (locks.get(key) === tail) {
      locks.delete(key);
    }
  }
}
