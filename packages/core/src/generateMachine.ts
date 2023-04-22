import { Typestate, createMachine } from 'xstate';
import { ZodTypeAny, z } from 'zod';

import { generateStatesFromSteps } from './generateStatesFromSteps';
import { Event, Steps, UnionToIntersectionSchema } from './types';

export const generateMachine = <
  TStepName extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>
>(options: {
  name: string;
  steps: Steps<TStepName>;
  schemas: TSchemas;
}) => {
  type SchemaKey = keyof TSchemas;

  type TValues = z.infer<
    // @ts-expect-error zod will correctly infer the type
    UnionToIntersectionSchema<Exclude<TSchemas[SchemaKey], undefined>>
  >;
  const machine = createMachine<TValues, Event, Typestate<TValues>>({
    predictableActionArguments: true,
    id: options.name,
    initial: options.steps[0].name,
    states: generateStatesFromSteps<TStepName, TSchemas>(options.steps),
  });
  return machine;
};
