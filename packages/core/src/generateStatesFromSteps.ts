import { ZodTypeAny } from 'zod';

import { Steps } from './types';

const getSkipWhenNextName = (name: string) => `__skip_${name}_next`;

const getSkipWhenBackName = (name: string) => `__skip_${name}_back`;

export const generateStatesFromSteps = <
  TStepName extends string,
  TCondition extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>,
>(
  steps: Steps<TStepName, TCondition>,
  schemas?: TSchemas,
) => {
  return steps.reduce((states, step, index) => {
    const isLast = index === steps.length - 1;
    const nextStep = isLast ? undefined : steps[index + 1];
    const prevStep = index === 0 ? undefined : steps[index - 1];
    const state = {
      initial: 'valid',
      on: {
        ...(nextStep
          ? {
              next: [
                {
                  actions: 'updateValues',
                  cond: 'areValuesValid',
                  target: nextStep.skip
                    ? getSkipWhenNextName(nextStep.name)
                    : nextStep.name,
                },
                {
                  actions: 'validationError',
                  target: '.error',
                },
              ],
            }
          : {}),
        ...(prevStep
          ? {
              back: prevStep.skip
                ? getSkipWhenBackName(prevStep.name)
                : prevStep.name,
            }
          : {}),
      },
      states: {
        error: {},
        valid: {},
      },
      ...(isLast ? { type: 'final' } : {}),
      meta: {
        schema: schemas?.[step.name],
      },
    };
    const newStates = {
      ...states,
      [step.name]: state,
    };
    if (!step.skip) {
      return newStates;
    }
    const nextConditions = step.skip.map((cond) => ({
      cond: cond.condition,
      target: cond.target,
    }));
    const backConditions = prevStep
      ? step.skip.map((cond) => ({
          cond: cond.condition,
          target: prevStep.name,
        }))
      : [];
    return {
      ...newStates,
      [getSkipWhenBackName(step.name)]: {
        always: [...backConditions, { target: step.name }],
      },
      [getSkipWhenNextName(step.name)]: {
        always: [...nextConditions, { target: step.name }],
      },
    };
  }, {});
};
