import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { WizardProvider, useWizard } from '../src/WizardProvider';

describe('Wizard Provider', () => {
  it('can navigate back and forth', async () => {
    const TestApp = () => {
      const { currentStep, goToNextStep, goToPreviousStep, restart } =
        useWizard();

      return (
        <div>
          <h1>{currentStep}</h1>
          <button onClick={goToPreviousStep}>Back</button>
          <button onClick={goToNextStep}>Next</button>
          <button onClick={restart}>Restart</button>
        </div>
      );
    };
    render(
      <WizardProvider
        schemas={{}}
        name="test-wizard"
        steps={[{ name: 'step1' }, { name: 'step2' }, { name: 'step3' }]}
      >
        <TestApp />
      </WizardProvider>
    );
    expect(await screen.findByText('step1')).toBeInTheDocument();
    screen.getByText('Back').click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(await screen.findByText('step1')).toBeTruthy();
    screen.getByText('Next').click();
    expect(await screen.findByText('step2')).toBeTruthy();
    screen.getByText('Back').click();
    expect(await screen.findByText('step1')).toBeTruthy();
    screen.getByText('Next').click();
    expect(await screen.findByText('step2')).toBeTruthy();
    screen.getByText('Next').click();
    expect(await screen.findByText('step3')).toBeTruthy();
    screen.getByText('Next').click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(await screen.findByText('step3')).toBeTruthy();
    screen.getByText('Back').click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(await screen.findByText('step3')).toBeTruthy();
    screen.getByText('Restart').click();
    expect(await screen.findByText('step1')).toBeTruthy();
  });

  it("can't navigate until values are valid", async () => {
    const TestApp = () => {
      const { currentStep, goToNextStep, goToPreviousStep, restart } =
        useWizard();
      const [value, setValue] = React.useState('');

      return (
        <div>
          <h1>{currentStep}</h1>
          <input
            type="text"
            name="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={goToPreviousStep}>Back</button>
          <button onClick={() => goToNextStep()}>Next</button>
          <button onClick={restart}>Restart</button>
        </div>
      );
    };
    render(
      <WizardProvider
        schemas={{
          step1: z.object({
            firstName: z.string(),
            lastName: z.string(),
          }),
          step2: z.object({
            age: z.number(),
          }),
          step3: z.object({
            email: z.string().email(),
          }),
        }}
        name="test-wizard"
        steps={[{ name: 'step1' }, { name: 'step2' }, { name: 'step3' }]}
      >
        <TestApp />
      </WizardProvider>
    );
    expect(await screen.findByText('step1')).toBeInTheDocument();
    screen.getByText('Next').click();
  });
});
