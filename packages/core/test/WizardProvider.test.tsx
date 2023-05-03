import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
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
        name="test-wizard"
        schemas={{}}
        steps={[{ name: 'step1' }, { name: 'step2' }, { name: 'step3' }]}
      >
        <TestApp />
      </WizardProvider>,
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
      const { setValue: setValueRHF } = useFormContext();
      const { currentStep, goToNextStep, goToPreviousStep, restart } =
        useWizard();
      const [value, setValue] = React.useState('');

      return (
        <div>
          <h1>{currentStep}</h1>
          <input
            name="value"
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue) {
                const values = JSON.parse(newValue);
                Object.entries(values).forEach(([key, value]) => {
                  setValueRHF(key, value);
                });
              }
              setValue(newValue);
            }}
            type="text"
            value={value}
          />
          <button onClick={goToPreviousStep}>Back</button>
          <button onClick={() => goToNextStep()}>Next</button>
          <button onClick={restart}>Restart</button>
        </div>
      );
    };
    render(
      <WizardProvider
        name="test-wizard"
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
        steps={[{ name: 'step1' }, { name: 'step2' }, { name: 'step3' }]}
      >
        <TestApp />
      </WizardProvider>,
    );
    expect(await screen.findByText('step1')).toBeInTheDocument();
    screen.getByText('Next').click();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '{"firstName": "Dominik", "lastName": "Garcia"}' },
    });
    screen.getByText('Next').click();
    expect(await screen.findByText('step2')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '{"age": 18}' },
    });
    screen.getByText('Next').click();
    expect(await screen.findByText('step3')).toBeInTheDocument();
  });
});
