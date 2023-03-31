import { StateNodeConfig, StateSchema } from 'xstate';

import { Event, Steps } from './types';

export const generateStatesFromSteps = <
  TStepName extends string,
  TStateSchema extends StateSchema
>(
  steps: Steps<TStepName>
): NonNullable<StateNodeConfig<unknown, TStateSchema, Event>['states']> => {
  return steps.reduce((states, step, index) => {
    const state = {
      on: {
        ...(index < steps.length - 1 ? { next: steps[index + 1].name } : {}),
        ...(index > 0 ? { previous: steps[index - 1].name } : {}),
      },
    };
    return {
      ...states,
      [step.name]: state,
    };
  }, {} as NonNullable<StateNodeConfig<unknown, TStateSchema, Event>['states']>);
};
