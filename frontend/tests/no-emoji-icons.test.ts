import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const SRC_ROOT = join(process.cwd(), 'src');
const EMOJI_RANGES = /[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
// ZWJ/FE0F 属于组合字符，不能放进字符类（会触发 no-misleading-character-class），单独判断
const hasBannedCharacter = (line: string): boolean =>
  EMOJI_RANGES.test(line) || line.includes('\u200D') || line.includes('\uFE0F');

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
          if (hasBannedCharacter(line)) {
            offenders.push(`${file.replace(SRC_ROOT, 'src')}:${index + 1}`);
          }
        });
    }

    expect(offenders).toEqual([]);
  });
});
