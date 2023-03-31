import { NoInfer, createMachine } from 'xstate';

import { generateStatesFromSteps } from './generateStateFromSteps';
import { Event, Steps } from './types';

export const createWizard = <TStepName extends string>(options: {
  name: string;
  steps: Steps<TStepName>;
  initialStep: NoInfer<TStepName>;
}) => {
  const machine = createMachine<unknown, Event, any>({
    id: options.name,
    initial: options.initialStep,
    states: generateStatesFromSteps(options.initialStep, options.steps),
  });
  return machine;
};
