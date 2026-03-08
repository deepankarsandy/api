type TestScope = "all" | "unit" | "integration" | "e2e";

const scope = (Bun.argv[2] ?? "all") as TestScope;
const extraArgs = Bun.argv.slice(3);
const cwd = process.cwd();

const patternsByScope: Record<TestScope, string[]> = {
  all: [
    "**/__tests__/**/*.test.unit.ts",
    "**/__tests__/**/*.test.integration.ts",
    "**/__tests__/**/*.test.e2e.ts",
  ],
  unit: ["**/__tests__/**/*.test.unit.ts"],
  integration: ["**/__tests__/**/*.test.integration.ts"],
  e2e: ["**/__tests__/**/*.test.e2e.ts"],
};

if (!patternsByScope[scope]) {
  console.error(`Unknown test scope: ${scope}`);
  process.exit(1);
}

const run = async () => {
  const files = new Set<string>();

  for (const pattern of patternsByScope[scope]) {
    const glob = new Bun.Glob(pattern);
    for await (const file of glob.scan({ cwd })) {
      files.add(`./${file}`);
    }
  }

  if (files.size === 0) {
    console.error(`No ${scope} test files found under __tests__.`);
    process.exit(1);
  }

  const command = ["bun", "test", ...extraArgs, ...Array.from(files).sort()];
  const result = Bun.spawnSync(command, { stdout: "inherit", stderr: "inherit" });

  process.exit(result.exitCode);
};

void run();
