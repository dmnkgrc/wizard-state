import { useAtom } from 'jotai';
import { RESTART, atomWithMachine } from 'jotai-xstate';
import React from 'react';

import { generateMachine } from './generateMachine';
import { Steps } from './types';

const WizardContext = React.createContext<
  | {
      goToNextStep: () => void;
      goToPreviousStep: () => void;
      restart: () => void;
      currentStep: string;
    }
  | undefined
>(undefined);

export const WizardProvider = <TStepName extends string>(props: {
  name: string;
  steps: Steps<TStepName>;
  children: React.ReactNode;
}) => {
  const generatedAtomWithMachine = React.useMemo(
    () =>
      atomWithMachine(
        generateMachine({
          name: props.name,
          steps: props.steps,
          schemas: {},
        })
      ),
    [props.name, props.steps]
  );
  const [state, send] = useAtom(generatedAtomWithMachine);

  const goToNextStep = () => {
    send({ type: 'next' });
  };

  const goToPreviousStep = () => {
    send({ type: 'back' });
  };

  const restart = () => {
    send(RESTART);
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep: state.value as TStepName,
        goToNextStep,
        goToPreviousStep,
        restart,
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
