import { MIN_POINTS_REGRESSION } from "../constants/precip";
import type { PairedPoint, RegressionResult } from "../types/regression";

// ---- Student-t p-value via the regularised incomplete beta function ----

function logGamma(x: number): number {
  const coefficients = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let series = 1.000000000190015;
  for (const c of coefficients) series += c / ++y;
  return -tmp + Math.log((2.5066282746310005 * series) / x);
}

function betaContinuedFraction(a: number, b: number, x: number): number {
  const TINY = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 3e-12) break;
  }
  return h;
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    logGamma(a + b) -
      logGamma(a) -
      logGamma(b) +
      a * Math.log(x) +
      b * Math.log(1 - x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (front * betaContinuedFraction(a, b, x)) / a
    : 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/** Two-sided p-value for a correlation coefficient with the given degrees of freedom. */
export function correlationPValue(r: number, dof: number): number | null {
  if (dof < 1) return null;
  if (Math.abs(r) >= 1) return 0;
  const t = r * Math.sqrt(dof / (1 - r * r));
  return regularizedIncompleteBeta(dof / (dof + t * t), dof / 2, 0.5);
}

// ---- Regression ----

const mean = (values: number[]): number =>
  values.reduce((s, v) => s + v, 0) / values.length;

function pearson(xs: number[], ys: number[]): number | null {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}

/** OLS of NDVI on rain, plus the rain-NDVI correlation controlling for day of year. */
export function analyzePairs(points: PairedPoint[]): RegressionResult | null {
  const n = points.length;
  if (n < MIN_POINTS_REGRESSION) return null;

  const rain = points.map((p) => p.precipMm);
  const ndvi = points.map((p) => p.ndvi);
  const doy = points.map((p) => p.doy);

  const r = pearson(rain, ndvi);
  if (r === null) return null; // no variation in rain or NDVI

  const meanRain = mean(rain);
  let sxx = 0;
  let sxy = 0;
  const meanNdvi = mean(ndvi);
  for (let i = 0; i < n; i++) {
    sxx += (rain[i] - meanRain) ** 2;
    sxy += (rain[i] - meanRain) * (ndvi[i] - meanNdvi);
  }
  const slope = sxy / sxx;

  let adjustedR: number | null = null;
  let adjustedP: number | null = null;
  const rainVsDate = pearson(rain, doy);
  const ndviVsDate = pearson(ndvi, doy);
  if (
    rainVsDate !== null &&
    ndviVsDate !== null &&
    Math.abs(rainVsDate) < 0.999 &&
    Math.abs(ndviVsDate) < 0.999
  ) {
    const raw =
      (r - rainVsDate * ndviVsDate) /
      Math.sqrt((1 - rainVsDate ** 2) * (1 - ndviVsDate ** 2));
    adjustedR = Math.max(-1, Math.min(1, raw));
    adjustedP = correlationPValue(adjustedR, n - 3);
  }

  return {
    n,
    slope,
    intercept: meanNdvi - slope * meanRain,
    r,
    r2: r * r,
    p: correlationPValue(r, n - 2),
    adjustedR,
    adjustedP,
  };
}
