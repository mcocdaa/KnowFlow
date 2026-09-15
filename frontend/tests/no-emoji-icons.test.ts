import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const SRC_ROOT = join(process.cwd(), 'src');
const BANNED =
  /[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;

const collectSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(fullPath);
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [fullPath] : [];
  });

describe('SVG-only icon policy', () => {
  it('contains no emoji or unicode pictographs under src/', () => {
    const offenders: string[] = [];

    for (const file of collectSourceFiles(SRC_ROOT)) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          const match = line.match(BANNED);
          if (match) {
            offenders.push(`${file.replace(SRC_ROOT, 'src')}:${index + 1} → ${match[0]}`);
          }
        });
    }

    expect(offenders).toEqual([]);
  });
});
