import { StatesConfig } from 'xstate';

import { Event, NoInfer, Steps } from './types';

type StateSchema<TValues, TStepName extends string> = {
  context?: Partial<TValues>;
  states: {
    [key in TStepName]: StateSchema<TValues, TStepName>;
  };
};

export const generateStatesFromSteps = <TValues, TStepName extends string>(
  steps: Steps<TStepName>
): StatesConfig<TValues, StateSchema<TValues, NoInfer<TStepName>>, Event> => {
  return steps.reduce((states, step, index) => {
    const isLast = index === steps.length - 1;
    const state = {
      on: {
        ...(!isLast ? { next: steps[index + 1].name } : {}),
        ...(index > 0 ? { back: steps[index - 1].name } : {}),
      },
      ...(isLast ? { type: 'final' } : {}),
    };
    return {
      ...states,
      [step.name]: state,
    };
  }, {} as StatesConfig<TValues, StateSchema<TValues, NoInfer<TStepName>>, Event>);
};
