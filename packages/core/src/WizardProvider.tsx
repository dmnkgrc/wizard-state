import { useAtom } from 'jotai';
import { RESTART, atomWithMachine } from 'jotai-xstate';
import React from 'react';
import { ZodTypeAny } from 'zod';

import { generateMachine } from './generateMachine';
import { Steps } from './types';

const WizardContext = React.createContext<
  | {
      goToNextStep: (values?: unknown) => void;
      goToPreviousStep: () => void;
      restart: () => void;
      currentStep: string;
      schema?: ZodTypeAny;
    }
  | undefined
>(undefined);

export const WizardProvider = <
  TStepName extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>
>(props: {
  name: string;
  steps: Steps<TStepName>;
  schemas: TSchemas;
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

  const goToNextStep = (values?: unknown) => {
    send({ type: 'next', values });
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
        schema: state.meta.schema,
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
