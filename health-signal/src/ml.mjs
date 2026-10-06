export const sigmoid = (z) =>
  1 / (1 + Math.exp(-Math.max(-700, Math.min(700, z))));
export function healthPredict(values, model) {
  if (values.length !== model.features.length)
    throw new Error("Incorrect feature count");
  const contributions = values.map((v, i) => {
    const x = v === null ? model.median[i] : v;
    if (!Number.isFinite(x)) throw new Error("Inputs must be finite numbers");
    return {
      name: model.features[i],
      value: ((x - model.mean[i]) / model.scale[i]) * model.coefficients[i],
      input: x,
    };
  });
  return {
    score: sigmoid(
      model.intercept + contributions.reduce((s, c) => s + c.value, 0),
    ),
    contributions,
    intercept: model.intercept,
  };
}
