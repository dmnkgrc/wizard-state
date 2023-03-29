import { describe, expect, it } from 'vitest';

import { createWizard } from '../src/createWizard';

describe('createWizard', () => {
  it('create a basic wizard correctly', () => {
    expect(
      createWizard({
        step1: {
          name: 'step1',
          next: 'step2',
        },
        step2: {
          name: 'step2',
          next: 'step3',
        },
        step3: {
          name: 'step3',
        },
      })
    ).toEqual({
      step1: {
        name: 'step1',
        next: 'step2',
      },
      step2: {
        name: 'step2',
        next: 'step3',
      },
      step3: {
        name: 'step3',
      },
    });
  });
});
