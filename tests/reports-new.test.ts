import {
  buildReportPayload,
  reportSchema,
  submitReport,
  type ReportFormValues,
} from "../src/app/reports/new/form-utils.js";
import { assert, runTests, type TestCase } from "./test-helpers.js";

function createValidValues(): ReportFormValues {
  return {
    playerId: "player-1",
    title: "Analyse complète",
    content: "Le joueur a réalisé une prestation solide avec une bonne implication.",
    rating: "7",
    strengths: "Vision de jeu remarquable",
    weaknesses: "Doit gagner en impact dans les duels",
    recommendation: "sign",
    matchDate: "2024-09-28",
  };
}

function createFetchMock(responses: Array<{ ok: boolean; body?: unknown }>) {
  const calls: any[] = [];
  const mock = async (...args: any[]) => {
    calls.push(args);
    const response = responses.shift() ?? { ok: true };
    return {
      ok: response.ok,
      json: async () => response.body ?? {},
    };
  };
  return { mock, calls };
}

const tests: TestCase[] = [
  {
    name: "reportSchema accepte des valeurs valides",
    run: () => {
      const values = createValidValues();
      const result = reportSchema.safeParse(values);
      assert.equal(result.success, true);
    },
  },
  {
    name: "reportSchema signale une erreur lorsque la note dépasse 10",
    run: () => {
      const values = createValidValues();
      values.rating = "11";
      const result = reportSchema.safeParse(values);
      assert.equal(result.success, false);
      if (!result.success) {
        const issue = result.error.issues.find((item) => item.path.join(".") === "rating");
        assert.ok(issue);
      }
    },
  },
  {
    name: "buildReportPayload structure les données attendues",
    run: () => {
      const values = createValidValues();
      const payload = buildReportPayload(values);
      assert.equal(payload.playerId, values.playerId);
      assert.equal(payload.title, values.title);
      assert.equal(payload.content, values.content);
      assert.equal(payload.rating, Number(values.rating));
      assert.equal(payload.recommendation, values.recommendation);
      assert.equal(payload.matchDate, values.matchDate);
    },
  },
  {
    name: "submitReport envoie la requête et retourne le payload",
    run: async () => {
      const { mock, calls } = createFetchMock([{ ok: true }]);
      const values = createValidValues();
      const payload = await submitReport(values, mock as unknown as typeof fetch);
      assert.equal(calls.length, 1);
      const [, options] = calls[0];
      assert.equal(options.method, "POST");
      const body = JSON.parse(options.body);
      assert.deepEqual(body, payload);
    },
  },
  {
    name: "submitReport remonte une erreur si l'API échoue",
    run: async () => {
      const { mock } = createFetchMock([{ ok: false, body: { error: "Erreur" } }]);
      const values = createValidValues();
      await assert.rejects(() => submitReport(values, mock as unknown as typeof fetch), /Erreur/);
    },
  },
];

void runTests(tests);
