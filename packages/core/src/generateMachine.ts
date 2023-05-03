import { Typestate, assign, createMachine } from 'xstate';
import { ZodError, ZodTypeAny } from 'zod';

import { generateStatesFromSteps } from './generateStatesFromSteps';
import { Event, Steps, ValuesFromSchemas } from './types';

export const generateMachine = <
  TStepName extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>,
>(options: {
  name: string;
  schemas: TSchemas;
  steps: Steps<TStepName>;
}) => {
  type TValues = ValuesFromSchemas<TSchemas>;
  type TContext = {
    error?: ZodError;
    values: TValues;
  };

  const machine = createMachine<TContext, Event, Typestate<TContext>>(
    {
      context: {
        values: {} as TValues,
      },
      id: options.name,
      initial: options.steps[0].name,
      predictableActionArguments: true,
      states: generateStatesFromSteps<TStepName, TSchemas>(
        options.steps,
        options.schemas,
      ),
    },
    {
      actions: {
        updateValues: assign((prevContext, event, meta) => {
          const stepName = meta.state?.value as TStepName;
          const schema = options.schemas?.[stepName];
          const values = 'values' in event ? event.values : undefined;
          if (!schema || !values) {
            return prevContext;
          }
          const res = schema.safeParse(values);
          if (!res.success) {
            throw new Error(
              `Expected validation to succeed for step ${stepName}`,
            );
          }
          return {
            error: undefined,
            values: {
              ...prevContext.values,
              ...res.data,
            },
          };
        }),
        validationError: assign({
          error: (_prevContext, event, meta) => {
            const stepName = meta.state?.value as TStepName;
            const schema = options.schemas[stepName];
            if (!schema) {
              throw new Error(
                `Expected step ${stepName} to have schema but did not find one`,
              );
            }
            const values = 'values' in event ? event.values : undefined;
            const res = schema.safeParse(values);
            if (res.success) {
              throw new Error(
                `Expected validation to faile for step ${stepName}`,
              );
            }
            return res.error;
          },
        }),
      },
      guards: {
        areValuesValid: (_context, event, meta) => {
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
    },
  );
  return machine;
};
