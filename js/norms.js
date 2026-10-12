// Reference data used by the mental check-up.
// Only spatial span gets an age/education percentile, because it is the only task
// with a published regression we can reproduce. Everything here is indicative,
// not a clinical assessment.

// Corsi span (forward), Italian adults aged 21–89, N = 340.
// Correction equation from the paper:
//   adjusted = raw + 0.7616·(ln(age) − 3.864) − 0.4229·(√education − 3.555)
// Sample mean 4.97, SD 1.03, model R² = 0.24.
// So the expected raw span for an age/education is the mean minus that correction,
// and the spread around it is the residual SD = 1.03·√(1 − 0.24) ≈ 0.90.
export const CORSI = {
  mean: 4.97, sd: 1.03, r2: 0.24,
  ageCoef: 0.7616, ageCenter: 3.864,
  eduCoef: 0.4229, eduCenter: 3.555,
  minAge: 21, maxAge: 89,
  source: 'Regression-based normative data for Corsi Span and Supraspan learning and recall among Italian adults (2024)',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11554723/'
};
CORSI.residualSd = CORSI.sd * Math.sqrt(1 - CORSI.r2);

const clampAge = a => Math.min(CORSI.maxAge, Math.max(CORSI.minAge, a));

export function corsiExpected(age, eduYears){
  const a=clampAge(age), e=Math.max(1, eduYears);
  return CORSI.mean - CORSI.ageCoef*(Math.log(a)-CORSI.ageCenter) + CORSI.eduCoef*(Math.sqrt(e)-CORSI.eduCenter);
}

// Standard normal CDF (Abramowitz–Stegun approximation)
export function normalCdf(z){
  const t=1/(1+0.2316419*Math.abs(z));
  const d=0.3989423*Math.exp(-z*z/2);
  const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  return z>0 ? 1-p : p;
}

// Share of people of that age and education with a lower expected span, 1–99
export function corsiPercentile(span, age, eduYears){
  const z=(span-corsiExpected(age,eduYears))/CORSI.residualSd;
  return Math.min(99, Math.max(1, Math.round(normalCdf(z)*100)));
}

// Education levels → approximate years of schooling
export const EDUCATION = [
  {id:'primary', years:8},
  {id:'secondary', years:10},
  {id:'upper', years:13},
  {id:'degree', years:17},
  {id:'postgrad', years:19}
];
export const eduYears = id => (EDUCATION.find(e=>e.id===id)||EDUCATION[2]).years;

// Context references (no percentile)
export const DIGITS_REF = { typical:7, spread:2, source:'Miller, G. A. (1956). The magical number seven, plus or minus two.' };
export const RT_REF = {
  labYoungAdults:230, // ms, simple reaction time in lab conditions (Der & Deary 2006 sample, as summarised by Woodley et al. 2015)
  source:'Der & Deary (2006), UK Health and Lifestyle Survey, N = 7,130',
  url:'https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2015.00452/full'
};
