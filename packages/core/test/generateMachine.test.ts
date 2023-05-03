import { assertType, describe, expect, it } from 'vitest';
import { ZodError, ZodIssueCode, z } from 'zod';

import { generateMachine } from '../src/generateMachine';

describe('generateMachine', () => {
  it('generates a basic machine correctly', () => {
    const machine = generateMachine({
      name: 'test-wizard',
      schemas: {},
      steps: [
        {
          name: 'step1',
        },
        {
          name: 'step2',
        },
        {
          name: 'step3',
        },
      ],
    });

    const { initialState } = machine;

    expect(initialState.matches('step1')).toEqual(true);
    expect(initialState.can('back')).toEqual(false);

    const secondState = machine.transition(initialState, 'next');
    expect(secondState.matches('step2')).toEqual(true);
    expect(machine.transition(secondState, 'back').matches('step1')).toEqual(
      true,
    );

    const thirdState = machine.transition(secondState, 'next');
    expect(thirdState.matches('step3')).toEqual(true);
    expect(thirdState.can('next')).toEqual(false);
    expect(thirdState.can('back')).toEqual(true);
    expect(thirdState.done).toEqual(true);
  });

  it('validates and stores values', () => {
    const machine = generateMachine({
      name: 'test-wizard',
      schemas: {
        step1: z.object({
          firstName: z.string(),
          lastName: z.string(),
        }),
        step2: z.object({
          email: z.string(),
        }),
        step3: z.object({
          age: z.number(),
        }),
      },
      steps: [
        {
          name: 'step1',
        },
        {
          name: 'step2',
        },
        {
          name: 'step3',
        },
      ],
    });

    const { initialState, context } = machine;

    assertType<{
      values: { bad: string };
      // @ts-expect-error
    }>(context);

    assertType<{
      values: {
        age: number;
        email: string;
        firstName: string;
        lastName: string;
      };
    }>(context);

    expect(initialState.matches('step1')).toEqual(true);
    expect(initialState.can('back')).toEqual(false);

    const secondState = machine.transition(initialState, 'next');
    expect(secondState.matches('step1')).toEqual(true);
    expect(secondState.context).toEqual({
      error: new ZodError([
        {
          code: ZodIssueCode.invalid_type,
          expected: 'object',
          received: 'undefined',
          // We disable sort-keys-fix for this test sicne otherwise the values would not match
          // eslint-disable-next-line sort-keys-fix/sort-keys-fix
          path: [],
          // eslint-disable-next-line sort-keys-fix/sort-keys-fix
          message: 'Required',
        },
      ]),
      values: {},
    });
    const thirdState = machine.transition(secondState, {
      type: 'next',
      values: {
        firstName: 'Dominik',
        lastName: 'Garcia',
      },
    });
    expect(thirdState.matches('step2')).toEqual(true);
    expect(thirdState.context).toEqual({
      error: undefined,
      values: {
        firstName: 'Dominik',
        lastName: 'Garcia',
      },
    });
    expect(machine.transition(thirdState, 'back').matches('step1')).toEqual(
      true,
    );
    expect(machine.transition(thirdState, 'back').context).toEqual({
      error: undefined,
      values: {
        firstName: 'Dominik',
        lastName: 'Garcia',
      },
    });
  });
});
