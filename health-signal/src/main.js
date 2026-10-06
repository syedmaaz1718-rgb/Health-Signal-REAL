import "./style.css";
import models from "../models/model.json";
import { healthPredict } from "./ml.mjs";
import {
  $,
  escape,
  shell,
  metric,
  download,
  contributionChart,
} from "./ui.mjs";
shell({
  name: "Health Signal",
  logo: "+",
  tag: "HEALTH DATA / EDUCATIONAL ML",
  title: "Understand the model.<br><em>Not a diagnosis.</em>",
  subtitle:
    "Explore reduced-feature classifiers trained on historical public datasets. Inspect model outputs, their limitations and the features that shaped them.",
  number: "04",
  theme: "health-theme",
});
const configs = {
  diabetes: {
    title: "Diabetes-label model",
    dataset: "Pima dataset",
    fields: [
      ["glucose", "Glucose (2-hour OGTT)", "mg/dL", 140, 40, 300, 1],
      ["dbp", "Diastolic blood pressure", "mmHg", 75, 30, 130, 1],
      ["bmi", "Body mass index", "kg/m²", 31, 15, 65, 0.1],
      ["age", "Age", "years", 38, 21, 81, 1],
    ],
    scope:
      "Pima cohort: adult women of Pima Indian heritage. Not validated for men, other populations, or contemporary Indian patients.",
  },
  heart: {
    title: "Heart-label model",
    dataset: "Cleveland dataset",
    fields: [
      ["age", "Age", "years", 55, 29, 77, 1],
      ["sex", "Dataset sex coding", "0 female / 1 male", 1, 0, 1, 1],
      ["sbp", "Resting systolic pressure", "mmHg", 145, 90, 200, 1],
      ["chol", "Serum cholesterol", "mg/dL", 240, 100, 570, 1],
    ],
    scope:
      "Small historical Cleveland clinical cohort. Reduced input set omits key clinical tests. No external validation; low test AUROC, so interpretation is especially limited.",
  },
};
let active = "diabetes";
$("#content").innerHTML =
  `<div class="notice"><strong>REAL PUBLIC DATA / NOT MEDICAL ADVICE.</strong> Trained on 768 Pima records and 303 UCI Cleveland records. The output is a historical dataset-label model score, not a diagnosis, a calibrated personal risk, or future disease probability. Do not change medication or delay care because of it. Prefer sample values; don't enter someone else's health information.</div><div class="workspace"><section class="panel panel-pad"><div class="panel-head"><h2>Explore a model</h2><span class="mono">LOCAL / PRIVATE</span></div><div class="health-tabs"><button id="diabetes">Diabetes label</button><button class="inactive" id="heart">Heart label</button></div><div id="fields"></div><label class="checkbox"><input type="checkbox" id="ack">I understand this is a dataset experiment, not a medical assessment.</label><div class="form-bottom"><button id="sample" class="secondary">Use sample</button><button id="analyze">Explore output ↗</button></div><div id="error" class="error" role="alert"></div><div class="model-card" id="scope"></div></section><section class="panel" id="result" aria-live="polite"><div class="empty"><span class="empty-symbol">+</span><h2>Interpret with care.</h2><p>Select a model and use sample values to see a transparent, limited classifier in action.</p></div></section></div><section class="method"><h3>VALIDATION / LIMITS</h3><p>Logistic regression with train-only median imputation and standardization. Stratified 75/25 holdout, seed 42. Pima model: AUROC ${models.diabetes.metrics.roc_auc.toFixed(3)}, accuracy ${(models.diabetes.metrics.accuracy * 100).toFixed(1)}% (${models.diabetes.metrics.test_rows} test rows). Cleveland model: AUROC ${models.heart.metrics.roc_auc.toFixed(3)}, accuracy ${(models.heart.metrics.accuracy * 100).toFixed(1)}% (${models.heart.metrics.test_rows} test rows). Neither has clinical calibration, external validation or fairness evaluation. Scores are not comparable across these datasets.</p></section>`;
function fields() {
  const c = configs[active];
  $("#fields").innerHTML =
    `<div class="field-grid">${c.fields.map(([id, label, unit, value, min, max, step]) => `<div class="field"><label for="${id}">${escape(label)}<br><small>${escape(unit)}</small></label>${id === "sex" ? `<select id="sex"><option value="0">0 · female</option><option value="1" selected>1 · male</option></select>` : `<input id="${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}" required>`}</div>`).join("")}</div>`;
  $("#scope").innerHTML =
    `<strong>${escape(c.dataset)} / cohort limitations</strong><p>${escape(c.scope)}</p>`;
  $("#diabetes").className = active === "diabetes" ? "" : "inactive";
  $("#heart").className = active === "heart" ? "" : "inactive";
  $("#error").textContent = "";
  $("#fields")
    .querySelectorAll("input,select")
    .forEach((el) =>
      el.addEventListener("input", () => {
        $("#result").innerHTML =
          '<div class="empty"><h2>Inputs changed.</h2><p>Explore again to compute a fresh result.</p></div>';
      }),
    );
}
for (const key of ["diabetes", "heart"])
  $("#" + key).onclick = () => {
    active = key;
    fields();
    $("#result").innerHTML =
      '<div class="empty"><span class="empty-symbol">+</span><h2>Model changed.</h2><p>Review the inputs and cohort limits before exploring this output.</p></div>';
  };
$("#sample").onclick = () => {
  fields();
  $("#ack").checked = false;
  $("#result").innerHTML =
    '<div class="empty"><h2>Sample loaded.</h2><p>Acknowledge the limitation and explore to compute a fresh output.</p></div>';
};
$("#analyze").onclick = () => {
  if (!$("#ack").checked) {
    $("#error").textContent =
      "Please acknowledge the educational limitation before continuing.";
    return;
  }
  const c = configs[active];
  const values = c.fields.map(([id]) =>
    $("#" + id).value === "" ? NaN : Number($("#" + id).value),
  );
  for (let i = 0; i < values.length; i++) {
    const [, name, , defaultValue, min, max] = c.fields[i];
    if (!Number.isFinite(values[i]) || values[i] < min || values[i] > max) {
      $("#error").textContent =
        `${name}: enter a number from ${min} to ${max}.`;
      return;
    }
  }
  $("#error").textContent = "";
  const m = models[active],
    out = healthPredict(values, m),
    s = Math.round(out.score * 100);
  const outside = values.some((v, i) => v < m.min[i] || v > m.max[i]);
  $("#result").innerHTML =
    `<div class="results-head"><div><span class="eyebrow">${escape(c.dataset.toUpperCase())} / EXPERIMENT</span><h2>Dataset-label score</h2></div><div class="score">${s}%<small>not personal disease risk</small></div></div><div class="result-body"><div class="metric-grid">${metric("Holdout AUROC", m.metrics.roc_auc.toFixed(3), "Discrimination, not calibration")}${metric("Test rows", m.metrics.test_rows, "Single small holdout")}${metric("Input features", m.features.length, "Reduced-feature classifier")}</div><div class="notice"><strong>What this number means:</strong> the fitted classifier assigns ${s}% model probability to the positive historical dataset label for this input. That is not the chance you have or will develop a disease.</div>${outside ? '<p class="small warn">One or more inputs fall outside the training-set range. This is an extrapolation and is less reliable.</p>' : ""}<h3>Which features moved the model output?</h3>${contributionChart(out.contributions)}<p class="small">Signed log-odds contributions relative to training-set means, not medical causes. Orange increases the model output; blue lowers it. Intercept: ${out.intercept.toFixed(2)} log-odds.</p><div class="model-card"><strong>What this model cannot tell you</strong><p>${escape(c.scope)} These few features are insufficient for clinical decisions. A low score is not an "all clear," and a high score is not a diagnosis.</p></div><div class="result-foot"><span class="small">Discuss health concerns with a qualified clinician.</span><button id="export" class="secondary">Export model output ↓</button></div><p class="small">Export contains entered values. Keep that file private.</p></div>`;
  $("#export").onclick = () =>
    download("health-signal-educational-output.json", {
      model: active,
      ...out,
      metrics: m.metrics,
      disclaimer: models.note,
    });
};
fields();

document.body.classList.add("clinical-layout");
