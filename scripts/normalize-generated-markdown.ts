import fs from "node:fs/promises";
import path from "node:path";
import {
  normalizeAllMarkdownFiles,
} from "../lib/telegram/markdown-normalizer";

type DirectoryResult = {
  directory: string;
  total: number;
  changed: number;
  changedFiles: string[];
};

async function directoryExists(
  directoryPath: string
) {
  try {
    const stats = await fs.stat(directoryPath);

    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function normalizeDirectory(
  directoryPath: string
): Promise<DirectoryResult> {
  const exists =
    await directoryExists(directoryPath);

  if (!exists) {
    console.warn(
      `Skipped missing directory: ${directoryPath}`
    );

    return {
      directory: directoryPath,
      total: 0,
      changed: 0,
      changedFiles: [],
    };
  }

  const result =
    await normalizeAllMarkdownFiles(
      directoryPath
    );

  return {
    directory: directoryPath,
    ...result,
  };
}

async function main() {
  const rootDirectory = process.cwd();

  const directories = [
    path.join(
      rootDirectory,
      "content",
      "posts"
    ),
    path.join(
      rootDirectory,
      "content",
      "telegram"
    ),
  ];

  const results: DirectoryResult[] = [];

  for (const directoryPath of directories) {
    const result =
      await normalizeDirectory(
        directoryPath
      );

    results.push(result);
  }

  let totalFiles = 0;
  let totalChangedFiles = 0;

  console.log(
    "\nMarkdown normalization result:\n"
  );

  for (const result of results) {
    totalFiles += result.total;
    totalChangedFiles += result.changed;

    const relativeDirectory = path.relative(
      rootDirectory,
      result.directory
    );

    console.log(
      `${relativeDirectory}:`
    );

    console.log(
      `  Checked: ${result.total}`
    );

    console.log(
      `  Updated: ${result.changed}`
    );

    for (
      const filePath of
      result.changedFiles
    ) {
      console.log(
        `  - ${path.relative(
          rootDirectory,
          filePath
        )}`
      );
    }

    console.log("");
  }

  console.log(
    `Total checked: ${totalFiles}`
  );

  console.log(
    `Total updated: ${totalChangedFiles}`
  );
}

main().catch((error: unknown) => {
  console.error(
    "Markdown normalization failed:",
    error
  );

  process.exitCode = 1;
});