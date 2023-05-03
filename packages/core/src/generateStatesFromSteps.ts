import { ZodTypeAny } from 'zod';

import { Steps } from './types';

export const generateStatesFromSteps = <
  TStepName extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>,
>(
  steps: Steps<TStepName>,
  schemas?: TSchemas,
) => {
  return steps.reduce((states, step, index) => {
    const isLast = index === steps.length - 1;
    const state = {
      on: {
        ...(!isLast
          ? {
              next: [
                {
                  actions: 'updateValues',
                  cond: 'areValuesValid',
                  target: steps[index + 1].name,
                },
                {
                  actions: 'validationError',
                  internal: true,
                },
              ],
            }
          : {}),
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
