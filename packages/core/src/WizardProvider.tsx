import { useAtom } from 'jotai';
import { atomWithMachine } from 'jotai-xstate';
import React from 'react';

import { generateMachine } from './generateMachine';
import { Steps } from './types';

const WizardContext = React.createContext<{
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  currentStep: string;
}>({
  currentStep: '',
  goToNextStep: () => {},
  goToPreviousStep: () => {},
});

export const WizardProvider = <TStepName extends string>(props: {
  name: string;
  steps: Steps<TStepName>;
  children: React.ReactNode;
}) => {
  const [state, send] = useAtom(
    atomWithMachine(
      generateMachine({
        name: props.name,
        steps: props.steps,
      })
    )
  );

  const goToNextStep = () => {
    send({ type: 'next' });
  };

  const goToPreviousStep = () => {
    send({ type: 'back' });
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep: state.value as TStepName,
        goToNextStep,
        goToPreviousStep,
      }}
    >
      {props.children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = React.useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
