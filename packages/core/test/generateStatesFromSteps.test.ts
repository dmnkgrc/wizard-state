import { describe, expect, it } from 'vitest';

import { generateStatesFromSteps } from '../src/generateStatesFromSteps';

describe('generateStatesFromSteps', () => {
  it('contains the expected states', () => {
    // @ts-expect-error not allowed
    expect(generateStatesFromSteps([])).toEqual({});

    expect(
      generateStatesFromSteps([
        {
          name: 'step1',
        },
      ])
    ).toEqual({
      step1: {
        on: {},
        type: 'final',
      },
    });

    expect(
      generateStatesFromSteps([
        {
          name: 'step1',
        },
        {
          name: 'step2',
        },
      ])
    ).toEqual({
      step1: {
        on: {
          next: 'step2',
        },
      },
      step2: {
        on: {
          back: 'step1',
        },
        type: 'final',
      },
    });

    expect(
      generateStatesFromSteps([
        {
          name: 'step1',
        },
        {
          name: 'step2',
        },
        {
          name: 'step3',
        },
      ])
    ).toEqual({
      step1: {
        on: {
          next: 'step2',
        },
      },
      step2: {
        on: {
          next: 'step3',
          back: 'step1',
        },
      },
      step3: {
        on: {
          back: 'step2',
        },
        type: 'final',
      },
    });
  });
});
