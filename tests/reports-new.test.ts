import {
  REPORT_CRITERIA,
  buildEmptyNotes,
  buildReportPayload,
  reportSchema,
  submitReport,
  type ReportFormValues,
} from "../src/app/reports/new/form-utils.js";
import { assert, runTests, type TestCase } from "./test-helpers.js";

type AttachmentMock = { name: string; size: number; type: string };

function createValidValues(): ReportFormValues {
  const notes = buildEmptyNotes();
  for (const key of Object.keys(notes)) {
    notes[key as keyof typeof notes] = "7";
  }
  return {
    playerId: "player-1",
    title: "Analyse complète",
    summary: "Le joueur a réalisé une prestation solide avec une bonne implication.",
    notes,
    recommendation: "sign",
    status: "draft",
    analysis: "A confirmer face à un adversaire plus physique.",
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
      values.notes[REPORT_CRITERIA[0].key] = "11";
      const result = reportSchema.safeParse(values);
      assert.equal(result.success, false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (item) => item.path.join(".") === `notes.${REPORT_CRITERIA[0].key}`
        );
        assert.ok(issue);
      }
    },
  },
  {
    name: "buildReportPayload structure les données avec les pièces jointes",
    run: () => {
      const values = createValidValues();
      const attachments: AttachmentMock[] = [
        { name: "sequence.mp4", size: 1024, type: "video/mp4" },
        { name: "rapport.pdf", size: 2048, type: "application/pdf" },
      ];
      const payload = buildReportPayload(values, attachments);
      assert.equal(payload.playerId, values.playerId);
      assert.equal(payload.title, values.title);
      assert.equal(payload.status, values.status);
      const content = JSON.parse(payload.content);
      assert.equal(content.summary, values.summary);
      assert.equal(content.notes[REPORT_CRITERIA[0].key], Number(values.notes[REPORT_CRITERIA[0].key]));
      assert.deepEqual(content.attachments, attachments);
    },
  },
  {
    name: "submitReport envoie la requête et retourne le payload",
    run: async () => {
      const { mock, calls } = createFetchMock([{ ok: true }]);
      const values = createValidValues();
      const payload = await submitReport(values, [], mock as unknown as typeof fetch);
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
      await assert.rejects(() => submitReport(values, [], mock as unknown as typeof fetch), /Erreur/);
    },
  },
];

void runTests(tests);
