import {
  AssignMeta,
  ConditionPredicate,
  GuardMeta,
  NoInfer,
  Typestate,
  assign,
  createMachine,
} from 'xstate';
import { ZodError, ZodTypeAny } from 'zod';

import { generateStatesFromSteps } from './generateStatesFromSteps';
import { Event, Steps, ValuesFromSchemas } from './types';

const getStepNameFromMeta = <
  TMeta extends GuardMeta<any, Event> | AssignMeta<any, Event>,
  TStepName extends string,
>(
  meta: TMeta,
): TStepName => {
  if (typeof meta.state?.value === 'string') {
    return meta.state.value as TStepName;
  }
  return Object.keys(meta.state?.value ?? {})[0] as TStepName;
};

export const generateMachine = <
  TStepName extends string,
  TCondition extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>,
>(
  config: {
    name: string;
    schemas: TSchemas;
    steps: Steps<TStepName, TCondition>;
  },
  options?: {
    conditions: NoInfer<
      Record<
        TCondition,
        ConditionPredicate<
          { error?: ZodError; values: ValuesFromSchemas<TSchemas> },
          Event
        >
      >
    >;
  },
) => {
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
      id: config.name,
      initial: config.steps[0].name,
      predictableActionArguments: true,
      states: generateStatesFromSteps<TStepName, TCondition, TSchemas>(
        config.steps,
        config.schemas,
      ),
    },
    {
      actions: {
        updateValues: assign((prevContext, event, meta) => {
          const stepName = getStepNameFromMeta<
            AssignMeta<TContext, Event>,
            TStepName
          >(meta);
          const schema = config.schemas?.[stepName];
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
            const stepName = getStepNameFromMeta<
              AssignMeta<TContext, Event>,
              TStepName
            >(meta);
            const schema = config.schemas[stepName];
            if (!schema) {
              console.warn(
                `Expected step ${stepName} to have schema but did not find one`,
              );
              return undefined;
            }
            const values = 'values' in event ? event.values : undefined;
            const res = schema.safeParse(values);
            if (res.success) {
              console.warn(`Expected validation to faile for step ${stepName}`);
              return undefined;
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
          const stepName = getStepNameFromMeta<
            GuardMeta<TContext, Event>,
            TStepName
          >(meta);
          const schema = config.schemas[stepName];
          if (!schema) {
            return true;
          }
          const res = schema.safeParse(event.values);
          return res.success;
        },
        ...options?.conditions,
      },
    },
  );
  return machine;
};
