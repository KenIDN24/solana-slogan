import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// One-line slogan for a Solana wallet agent.
// The slogan: six words, one breath, dry punchline.
const SLOGAN = "You sleep. I sign. Solana doesn't.";

// Sealed gate (verified against the kit's RULES.txt):
// entry.txt must be UTF-8, 1-140 characters, not only whitespace,
// and the brief caps the slogan at 20 words.
const MAX_CHARS = 140;
const MAX_WORDS = 20;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

if (SLOGAN.length < 1 || SLOGAN.length > MAX_CHARS) {
  fail(`entry must be 1-${MAX_CHARS} characters, got ${SLOGAN.length}`);
}

if (SLOGAN.trim().length === 0) {
  fail("entry must not be only whitespace");
}

// Control characters (other than the single trailing newline we add)
// would corrupt a one-line slogan and break the sealed UTF-8 check.
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(SLOGAN)) {
  fail("entry must not contain control characters");
}

const words = SLOGAN.trim().split(/\s+/);
if (words.length > MAX_WORDS) {
  fail(`entry must be at most ${MAX_WORDS} words, got ${words.length}`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, SLOGAN + "\n", "utf8");

// Read-back check: what landed on disk must be exactly the slogan.
import { readFileSync } from "node:fs";
const onDisk = readFileSync(outPath, "utf8");
if (onDisk !== SLOGAN + "\n") {
  fail("read-back mismatch: entry.txt on disk differs from the slogan");
}
console.log(`wrote ${outPath} (${SLOGAN.length} chars, ${words.length} words)`);
