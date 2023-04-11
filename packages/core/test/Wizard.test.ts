import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { Wizard } from '../src/Wizard';

describe('Wizard class', () => {
  it('can go navigate steps', () => {
    const wizard = new Wizard(
      'test-wizard',
      [
        {
          name: 'step1',
        },
        {
          name: 'step2',
        },
      ],
      z.object({})
    );
    expect(wizard.getCurrentStep()).toEqual('step1');
    wizard.nextStep();

    expect(wizard.getCurrentStep()).toEqual('step2');
  });
});
