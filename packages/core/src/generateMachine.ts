import { Typestate, createMachine } from 'xstate';
import { ZodTypeAny, z } from 'zod';

import { generateStatesFromSteps } from './generateStatesFromSteps';
import { Event, Steps, ValuesFromSchemas } from './types';

export const generateMachine = <
  TStepName extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>
>(options: {
  name: string;
  steps: Steps<TStepName>;
  schemas: TSchemas;
}) => {
  type TValues = ValuesFromSchemas<TSchemas>;
  const machine = createMachine<TValues, Event, Typestate<TValues>>({
    predictableActionArguments: true,
    id: options.name,
    initial: options.steps[0].name,
    states: generateStatesFromSteps<TStepName, TSchemas>(options.steps),
  });
  return machine;
};
