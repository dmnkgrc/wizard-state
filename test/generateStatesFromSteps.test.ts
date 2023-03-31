import { describe, expect, test } from 'vitest';

import { generateStatesFromSteps } from '../src/generateStatesFromSteps';

describe('generateStatesFromSteps', () => {
  test('contains the expected states', () => {
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
          previous: 'step1',
        },
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
          previous: 'step1',
        },
      },
      step3: {
        on: {
          previous: 'step2',
        },
      },
    });
  });
});
