import { Steps } from './types';

export const createWizard = <TStepName extends string>(
  steps: Steps<TStepName>
) => {
  return steps;
};
