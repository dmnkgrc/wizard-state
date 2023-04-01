import { createMachine } from 'xstate';
import { z } from 'zod';

import { generateStatesFromSteps } from './generateStatesFromSteps';
import { Event, Steps } from './types';

export const generateMachine = <
  TStepName extends string,
  TSchema extends z.ZodTypeAny,
  TValues = z.infer<TSchema>
>(options: {
  name: string;
  steps: Steps<TStepName>;
  schema: TSchema;
}) => {
  const machine = createMachine<TValues, Event, any>({
    predictableActionArguments: true,
    id: options.name,
    initial: options.steps[0].name,
    states: generateStatesFromSteps<TValues, TStepName>(options.steps),
  });
  return machine;
};
