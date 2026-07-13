const DAY = 24 * 60 * 60 * 1000;

// Step 1: 5 days, step 2: 5 days, step 3+: 7 days, last step (whichever number it is): 10 days.
export function getGrievanceStepDeadline(stepOrder: number, isLastStep: boolean): Date {
  const days = isLastStep ? 10 : stepOrder <= 2 ? 5 : 7;
  return new Date(Date.now() + days * DAY);
}
