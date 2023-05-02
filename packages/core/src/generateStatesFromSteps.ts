import { assign } from 'xstate';
import { ZodError, ZodTypeAny, z } from 'zod';

import { Event, NoInfer, Steps } from './types';

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
        ...(!isLast
          ? {
              next: [
                {
                  cond: 'areValuesValid',
                  target: steps[index + 1].name,
                  actions: assign<{ values?: object; error?: ZodError }, Event>(
                    (prevContext, event: Event & { values?: unknown }) => {
                      const schema = schemas?.[step.name];
                      if (!schema) {
                        return prevContext;
                      }
                      const res = schema.safeParse(event.values);
                      if (!res.success) {
                        throw new Error(
                          `Expected validation to faile for step ${step.name}`
                        );
                      }
                      return {
                        error: undefined,
                        values: {
                          ...prevContext.values,
                          ...res.data,
                        },
                      };
                    }
                  ),
                },
                {
                  internal: true,
                  target: step.name,
                  actions: assign(
                    (_prevContext, event: Event & { values?: unknown }) => {
                      const schema = schemas?.[step.name];
                      if (!schema) {
                        throw new Error(
                          `Expected step ${step.name} to have schema but did not find one`
                        );
                      }
                      const res = schema.safeParse(event.values);
                      if (res.success) {
                        throw new Error(
                          `Expected validation to fail for step ${step.name}`
                        );
                      }
                      return {
                        error: res.error,
                      };
                    }
                  ),
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
