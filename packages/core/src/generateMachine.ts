import { Typestate, assign, createMachine } from 'xstate';
import { ZodError, ZodTypeAny } from 'zod';

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
  type TContext = {
    values: TValues;
    error?: ZodError;
  };

  const machine = createMachine<TContext, Event, Typestate<TContext>>(
    {
      predictableActionArguments: true,
      id: options.name,
      initial: options.steps[0].name,
      states: generateStatesFromSteps<TStepName, TSchemas>(
        options.steps,
        options.schemas
      ),
      context: {
        values: {} as TValues,
      },
    },
    {
      actions: {
        // addErrorToContext: assign<TContext>(
        //   (_prevContext, event: Event & { values?: unknown }, meta) => {
        //     console.log('WHAAT');
        //     const stepName = meta.state?.value as TStepName;
        //     const schema = options.schemas[stepName];
        //     if (!schema) {
        //       throw new Error(
        //         `Expected step ${stepName} to have schema but did not find one`
        //       );
        //     }
        //     const res = schema.safeParse(event.values);
        //     if (res.success) {
        //       throw new Error(
        //         `Expected validation to faile for step ${stepName}`
        //       );
        //     }
        //     console.log('HELLOOOOO');
        //     assign(() => ({
        //       error: 'Byke',
        //     }));
        //     return {
        //       error: res.success ? undefined : res.error,
        //     };
        //   }
        // ),
      },
      guards: {
        areValuesValid: (context, event, meta) => {
          if (event.type !== 'next') {
            return true;
          }
          const schema = options.schemas[meta.state.value as TStepName];
          if (!schema) {
            return true;
          }
          const res = schema.safeParse(event.values);
          return res.success;
        },
      },
    }
  );
  return machine;
};
