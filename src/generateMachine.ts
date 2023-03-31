import { createMachine } from 'xstate';

import { generateStatesFromSteps } from './generateStatesFromSteps';
import { Event, Steps } from './types';

export const generateMachine = <TStepName extends string>(options: {
  name: string;
  steps: Steps<TStepName>;
}) => {
  const machine = createMachine<unknown, Event, any>({
    predictableActionArguments: true,
    id: options.name,
    initial: options.steps[0].name,
    states: generateStatesFromSteps(options.steps),
  });
  return machine;
};
