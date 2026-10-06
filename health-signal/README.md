# Health Signal

Educational, transparent classifiers on historical Pima and Cleveland health datasets.

**A working ML/data-science portfolio project, not a production decision system.**

> **Not medical advice or a diagnosis.** Output scores classify historical dataset labels; they are not calibrated personal disease risk or future risk. A low score is not an all-clear. Do not change treatment or delay care based on this app.

## What it does

Switch dataset models, inspect model scores and contributions, see cohort/validation limits and export private educational outputs.

## Real public-data provenance

Training uses actual historical Pima (768 records) and UCI Cleveland (303 records), not generated patients. Raw datasets and source hashes are included. Sources: https://archive.ics.uci.edu/dataset/45/heart+disease and https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.csv. These cohorts do not establish present-day or individual clinical validity. See data/README.md.

## Model and evidence

- **Method:** Reduced-feature logistic regression with median imputation and standardization fitted only on training data. All weights are exported to JSON.
- **Training data:** Pima: 768 records, using 2-hour OGTT glucose, diastolic BP, BMI and age. Cleveland: 303 records, using age, dataset sex coding, resting systolic BP and cholesterol.
- **Evaluation:** Stratified 75/25 holdout, seed 42. Diabetes: AUROC 0.809, accuracy 72.4%, Brier 0.174 (192 test rows). Heart: AUROC 0.672, accuracy 61.8%, Brier 0.229 (76 test rows).
- **Pipeline:** Inputs → training-median handling → training-mean/scale standardization → logistic score → exact signed feature contributions.

## Portfolio talking points

Explain the feature pipeline, data provenance, holdout design, cross-language model export, and why the output is limited. Do not present synthetic metrics as real-world validation or claim clinical/ATS accuracy.

## Limitations and next steps

Improve dataset documentation, external validation, calibration and subgroup evaluation. Clinical use would need qualified medical oversight and regulatory review; this app is not a medical device.

Read [`models/MODEL_CARD.md`](models/MODEL_CARD.md) before interpreting outputs.

## Run locally

Node **22.23.3 or newer** is required. `.nvmrc` pins the tested version.

```bash
npm ci
npm test
npm run dev
```

Open the local URL printed by Vite. No Python, API keys, accounts or training are needed to use the app.

## Deploy in under a minute (prebuilt)

1. Extract the project ZIP.
2. Sign in at [Netlify](https://app.netlify.com/login), then open [Netlify Drop](https://app.netlify.com/drop).
3. Drag the **`dist` folder inside this project** into the drop area. Drop `dist`, not `src` or `models`.
4. Open the `netlify.app` URL Netlify returns. The included `dist` is already production-built and tested.
5. After source edits, run `npm ci && npm run build`, then deploy the new `dist`.

Reference: [Netlify manual deployment docs](https://docs.netlify.com/manage/projects/add-new-project/).

### GitHub-connected Netlify deployment

Create a fresh GitHub repository and upload **the contents of this project folder** (README and package.json must sit at repository root). Do not upload the ZIP as your only file. Keep `node_modules` out of GitHub. In Netlify, import that repository, use build command `npm run build`, publish directory `dist`, and `NODE_VERSION=22.23.3`. `netlify.toml` already supplies these values.

No Render server or Streamlit service is needed. The Python model was trained ahead of time; the JavaScript app evaluates the exact exported model locally.

## Reproduce the model (optional)

Tested training environment: **Python 3.10**, NumPy 2.2.6, scikit-learn 1.7.2.

```bash
python3 -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell instead: .venv\Scripts\Activate.ps1
pip install -r training/requirements.txt
python training/train.py
npm test
npm run build
```

Training overwrites `models/model.json` and cross-language test fixtures. Fixed seed 42 makes the experiment reproducible within the pinned environment. Models are JSON, not pickle, so deployment does not execute deserialized Python objects.

## Architecture

```
training/train.py  -> data + trained sklearn model -> models/model.json
models/model.json -> browser inference in src/ml.mjs -> src/main.js UI
                     tests/model.test.mjs checks sklearn parity
```

- `src/main.js`: input validation, rendering and interactions.
- `src/ml.mjs`: pure inference/math functions; only the relevant functions are bundled.
- `src/ui.mjs` / `src/style.css`: responsive interface and inline SVG charts.
- `models/`: frozen model artifacts and model card.
- `data/`: documented training data/corpus.
- `tests/`: Node unit tests and sklearn-generated golden outputs.
- `dist/`: prebuilt static deployment, included deliberately.
- `screenshots/`: desktop start/result screens and mobile result view.
- `.github/workflows/ci.yml`: build + test on push/PR.

## Screenshots

Actual UI screenshots, not mockups:

![Main screen](screenshots/main.png)
![Model output](screenshots/results.png)

Mobile screenshot: [mobile.png](screenshots/mobile.png).
After deploying, you can replace these with your own screenshots. Live demo URL: **add your Netlify URL here**.

## Verification

- `npm test`: numerical parity with Python/scikit-learn golden fixtures at 1e-10 tolerance, plus project-specific edge cases.
- `npm run build`: production bundle.
- Manual/automated Chromium checks: desktop 1440px, phone 390px, form validation, sample-to-result flows, JSON download and no uncaught browser errors.
- Outputs are computed from committed model weights; no fabricated API responses or random UI scores.

## Privacy and security

No analytics, remote model APIs, file uploads, cookies or local-storage persistence. Text/values are processed in browser memory and clear on refresh. Netlify still receives ordinary page requests; hosting access logs are separate from model inputs. Use exports carefully, especially health inputs. Dynamic text inserted into markup is escaped. Source and model weights are intentionally public when you publish the repository.

## Stack and design

Python + scikit-learn for model fitting; framework-free JavaScript ES modules, Vite 8 and CSS for inference/UI. No third-party browser runtime dependencies or remote fonts. This keeps deployment small, avoids sending private inputs to a server, and makes inference inspectable. Near-black grid backgrounds, accent glows, bold Space Grotesk headings, Inter body text, gradient actions and responsive result panels make the interface cinematic. Both font files are bundled locally with their OFL licenses; no remote font requests. Motion respects prefers-reduced-motion.

## License

Application code: MIT. Third-party datasets keep their original terms; see `data/README.md`. Do not claim model validation outside the stated dataset or population.
