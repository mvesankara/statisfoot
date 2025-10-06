export type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

export const assert = {
  equal(actual: unknown, expected: unknown, message?: string) {
    if (actual !== expected) {
      throw new Error(
        message ?? `Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`,
      );
    }
  },
  deepEqual(actual: unknown, expected: unknown, message?: string) {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    if (actualJson !== expectedJson) {
      throw new Error(message ?? `Expected ${expectedJson} but received ${actualJson}`);
    }
  },
  ok(value: unknown, message?: string) {
    if (!value) {
      throw new Error(message ?? "Expected value to be truthy");
    }
  },
  async rejects(fn: () => Promise<unknown>, expected: RegExp, message?: string) {
    try {
      await fn();
    } catch (error) {
      if (!expected.test(String(error))) {
        throw new Error(
          message ?? `Expected error to match ${expected}, received ${String(error)}`,
        );
      }
      return;
    }

    throw new Error(message ?? "Expected promise to reject");
  },
};

type ProcessLike = { exitCode?: number };

function setExitCode(code: number) {
  if (typeof globalThis !== "object" || globalThis === null) {
    return;
  }

  if (!("process" in globalThis)) {
    return;
  }

  const processRef = (globalThis as { process?: ProcessLike }).process;
  if (processRef) {
    processRef.exitCode = code;
  }
}

export async function runTests(testCases: TestCase[]) {
  let passed = 0;
  for (const test of testCases) {
    try {
      await test.run();
      passed += 1;
      console.log(`✔ ${test.name}`);
    } catch (error) {
      console.error(`✖ ${test.name}`);
      console.error(error);
      setExitCode(1);
    }
  }

  if (passed === testCases.length) {
    console.log(`\n${passed} tests réussis`);
  }
}
