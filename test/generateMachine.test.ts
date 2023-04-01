import { assertType, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { generateMachine } from '../src/generateMachine';

describe('generateMachine', () => {
  it('generates a basic machine correctly', () => {
    const machine = generateMachine({
      name: 'test-wizard',
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
      schema: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        age: z.number(),
      }),
    });

    const { initialState, context } = machine;

    assertType<{
      bad: string;
      // @ts-expect-error
    }>(context);

    assertType<{
      firstName: string;
      lastName: string;
      email: string;
      age: number;
    }>(context);

    expect(initialState.matches('step1')).toEqual(true);
    expect(initialState.can('back')).toEqual(false);

    const secondState = machine.transition(initialState, 'next');
    expect(secondState.matches('step2')).toEqual(true);
    expect(machine.transition(secondState, 'back').matches('step1')).toEqual(
      true
    );

    const thirdState = machine.transition(secondState, 'next');
    expect(thirdState.matches('step3')).toEqual(true);
    expect(thirdState.can('next')).toEqual(false);
    expect(thirdState.can('back')).toEqual(true);
    expect(thirdState.done).toEqual(true);
  });
});
