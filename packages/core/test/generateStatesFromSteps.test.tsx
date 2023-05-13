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
      ]),
    ).toEqual({
      step1: {
        initial: 'valid',
        meta: {
          schema: undefined,
        },
        on: {},
        states: {
          error: {},
          valid: {},
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
      ]),
    ).toEqual({
      step1: {
        initial: 'valid',
        meta: {
          schema: undefined,
        },
        on: {
          next: [
            {
              actions: 'updateValues',
              cond: 'areValuesValid',
              target: 'step2',
            },
            {
              actions: 'validationError',
              target: '.error',
            },
          ],
        },
        states: {
          error: {},
          valid: {},
        },
      },
      step2: {
        initial: 'valid',
        meta: {
          schema: undefined,
        },
        on: {
          back: 'step1',
        },
        states: {
          error: {},
          valid: {},
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
      ]),
    ).toEqual({
      step1: {
        initial: 'valid',
        meta: {
          schema: undefined,
        },
        on: {
          next: [
            {
              actions: 'updateValues',
              cond: 'areValuesValid',
              target: 'step2',
            },
            {
              actions: 'validationError',
              target: '.error',
            },
          ],
        },
        states: {
          error: {},
          valid: {},
        },
      },
      step2: {
        initial: 'valid',
        meta: {
          schema: undefined,
        },
        on: {
          back: 'step1',
          next: [
            {
              actions: 'updateValues',
              cond: 'areValuesValid',
              target: 'step3',
            },
            {
              actions: 'validationError',
              target: '.error',
            },
          ],
        },
        states: {
          error: {},
          valid: {},
        },
      },
      step3: {
        initial: 'valid',
        meta: {
          schema: undefined,
        },
        on: {
          back: 'step2',
        },
        states: {
          error: {},
          valid: {},
        },
        type: 'final',
      },
    });
  });
});
