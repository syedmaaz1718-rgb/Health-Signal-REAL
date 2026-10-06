# Health dataset provenance

## Pima Indians diabetes

- Included file: `pima.csv`, 768 records, no header.
- Downloaded mirror: https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.csv
- Original documentation: https://mldata-static.ml.tu-berlin.de/repository/data/viewslug/uci-20070111-diabetes/1.html
- Variable/zero-value documentation: https://search.r-project.org/CRAN/refmans/mlbench/html/PimaIndiansDiabetes.html
- Original source: National Institute of Diabetes and Digestive and Kidney Diseases; original paper: Smith et al. (1988), “Using the ADAP learning algorithm to forecast the onset of diabetes mellitus.”
- Cohort: women aged at least 21 of Pima Indian heritage, not a representative global patient sample.
- Column order: pregnancies, 2-hour OGTT plasma glucose, diastolic BP, skin thickness, insulin, BMI, diabetes pedigree, age, binary diabetes label.
- Four selected model features: glucose, diastolic BP, BMI, age. Physiologically impossible zero values are imputed from training medians.
- Mirror does not display an explicit dataset-specific license. The application MIT license does **not** relicense the dataset. Review original terms before redistributing outside this educational repository.

## Cleveland heart disease

- Included file: `cleveland.csv`, 303 rows, no header.
- Original file: https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data
- Dataset page: https://archive.ics.uci.edu/dataset/45/heart+disease
- Citation: Janosi, A., Steinbrunn, W., Pfisterer, M., & Detrano, R. (1989). Heart Disease [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C52P4X
- CC BY 4.0, as documented by dataset distribution sources; keep attribution.
- Column order: age, sex, chest-pain type, resting systolic BP, cholesterol, fasting-blood-sugar flag, resting ECG, maximum heart rate, exercise angina, oldpeak, slope, vessels, thal, disease target (0-4).
- Target binarized as original target > 0. Selected features: age, sex coding, resting systolic BP, cholesterol. No missing selected Cleveland values; imputation is included defensively.

Raw file SHA-256 hashes are recorded in `models/model.json`. All model preprocessing is fitted on training rows only. Reduced-feature models deliberately avoid requiring specialist tests, but that makes predictive performance weaker. Not for clinical use.
