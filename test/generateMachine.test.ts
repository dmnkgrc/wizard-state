import { describe, expect, it } from 'vitest';

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
    });

    const { initialState } = machine;

    expect(initialState.matches('step1')).toEqual(true);
    expect(machine.transition(initialState, 'back').matches('step1')).toEqual(
      true
    );

    const secondState = machine.transition(initialState, 'next');
    expect(secondState.matches('step2')).toEqual(true);
    expect(machine.transition(secondState, 'back').matches('step1')).toEqual(
      true
    );

    const thirdState = machine.transition(secondState, 'next');
    expect(thirdState.matches('step3')).toEqual(true);
    expect(machine.transition(thirdState, 'next').matches('step3')).toEqual(
      true
    );
    expect(machine.transition(thirdState, 'back').matches('step2')).toEqual(
      true
    );
  });
});
