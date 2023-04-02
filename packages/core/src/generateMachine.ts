import { Typestate, createMachine } from 'xstate';

import { generateStatesFromSteps } from './generateStatesFromSteps';
import { Event, Steps } from './types';

export const generateMachine = <TStepName extends string, TValues>(options: {
  name: string;
  steps: Steps<TStepName>;
}) => {
  const machine = createMachine<TValues, Event, Typestate<TValues>>({
    predictableActionArguments: true,
    id: options.name,
    initial: options.steps[0].name,
    states: generateStatesFromSteps<TValues, TStepName>(options.steps),
  });
  return machine;
};
