import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { healthPredict, sigmoid } from "../src/ml.mjs";
const models = JSON.parse(
  fs.readFileSync(new URL("../models/model.json", import.meta.url)),
);
for (const [key, file] of [
  ["diabetes", "pima"],
  ["heart", "cleveland"],
]) {
  const f = JSON.parse(
    fs.readFileSync(new URL(`./${file}-parity.json`, import.meta.url)),
  );
  test(`${key}: JS equals sklearn probability to 1e-10`, () =>
    assert.ok(
      Math.abs(healthPredict(f.values, models[key]).score - f.expected) < 1e-10,
    ));
  test(`${key}: explanations sum to prediction`, () => {
    const x = healthPredict(f.values, models[key]);
    assert.equal(
      sigmoid(x.intercept + x.contributions.reduce((n, c) => n + c.value, 0)),
      x.score,
    );
  });
}
test("nonfinite and wrong-length inputs rejected", () => {
  assert.throws(() => healthPredict([NaN, 1, 1, 1], models.heart));
  assert.throws(() => healthPredict([1], models.heart));
});
test("median imputation finite", () =>
  assert.ok(
    Number.isFinite(
      healthPredict([null, null, null, null], models.diabetes).score,
    ),
  ));
