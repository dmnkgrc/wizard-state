import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it } from 'vitest';

import { WizardProvider, useWizard } from '../src/WizardProvider';

describe('Wizard Provider', () => {
  it('can navigate back and forth', async ({ expect }) => {
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
});
