import { StatesConfig } from 'xstate';

import { Event, NoInfer, Steps } from './types';

type StateSchema<TStepName extends string> = {
  context?: Partial<any>;
  states: {
    [key in TStepName]: StateSchema<TStepName>;
  };
};

export const generateStatesFromSteps = <TStepName extends string>(
  steps: Steps<TStepName>
): StatesConfig<unknown, StateSchema<NoInfer<TStepName>>, Event> => {
  return steps.reduce((states, step, index) => {
    const state = {
      on: {
        ...(index < steps.length - 1 ? { next: steps[index + 1].name } : {}),
        ...(index > 0 ? { back: steps[index - 1].name } : {}),
      },
    };
    return {
      ...states,
      [step.name]: state,
    };
  }, {} as StatesConfig<unknown, StateSchema<NoInfer<TStepName>>, Event>);
};
