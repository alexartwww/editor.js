/**
 * Post-build step: assemble the published type declarations into `dist/types/`.
 *
 * The hand-maintained `types/` tree is the source of truth, but a few of its
 * files ship with a plain `.ts` extension (they hold runtime `enum`/`const`
 * members that `src/` imports as values, so the bundler has to compile them).
 * When a consumer's TypeScript picks the package up, those `.ts` files land in
 * the consumer's program as real source and trigger noise such as
 * "<file> is part of the TypeScript compilation but it's unused"
 * (see @ngtools/webpack).
 *
 * Every file under `types/` is declaration-only in practice (`type` / `interface`
 * / `enum` / `const <literal>` — all valid in a `.d.ts`), so we copy the tree
 * verbatim into `dist/types/` and rename `*.ts` -> `*.d.ts`. `package.json`
 * points `types` at `dist/types/index.d.ts`; the runtime values keep coming from
 * the bundled `dist/editorjs.mjs`. Only `dist/` is published (see `.npmignore`),
 * so the loose `.ts` files never reach consumers.
 */
import { cpSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(repoRoot, 'types');
const outDir = join(repoRoot, 'dist', 'types');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(srcDir, outDir, { recursive: true });

/**
 * @param {string} dir - directory to walk, renaming every `*.ts` (that is not
 *   already `*.d.ts`) to `*.d.ts`.
 */
function renameTsToDts(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      renameTsToDts(full);
      continue;
    }

    if (full.endsWith('.ts') && !full.endsWith('.d.ts')) {
      renameSync(full, `${full.slice(0, -'.ts'.length)}.d.ts`);
    }
  }
}

renameTsToDts(outDir);

console.log(`copy-types: wrote declarations to ${outDir}`);
