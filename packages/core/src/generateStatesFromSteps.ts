import { StatesConfig } from 'xstate';
import { ZodTypeAny, z } from 'zod';

import { Event, NoInfer, Steps } from './types';

type StateSchema<TValues, TStepName extends string> = {
  context?: Partial<TValues>;
  states: {
    [key in TStepName]: StateSchema<TValues, TStepName>;
  };
};

export const generateStatesFromSteps = <
  TStepName extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>
>(
  steps: Steps<TStepName>,
  schemas?: TSchemas
) => {
  return steps.reduce((states, step, index) => {
    const isLast = index === steps.length - 1;
    const state = {
      on: {
        ...(!isLast ? { next: steps[index + 1].name } : {}),
        ...(index > 0 ? { back: steps[index - 1].name } : {}),
      },
      ...(isLast ? { type: 'final' } : {}),
      meta: {
        schema: schemas?.[step.name],
      },
    };
    return {
      ...states,
      [step.name]: state,
    };
  }, {});
};
