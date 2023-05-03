import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { RESTART, atomWithMachine } from 'jotai-xstate';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ZodTypeAny } from 'zod';

import { generateMachine } from './generateMachine';
import { Steps } from './types';

const WizardContext = React.createContext<
  | {
      currentStep: string;
      goToNextStep: () => void;
      goToPreviousStep: () => void;
      restart: () => void;
      schema?: ZodTypeAny;
    }
  | undefined
>(undefined);

export const WizardProvider = <
  TStepName extends string,
  TSchemas extends Partial<Record<TStepName, ZodTypeAny>>,
>(props: {
  children: React.ReactNode;
  name: string;
  schemas: TSchemas;
  steps: Steps<TStepName>;
}) => {
  const generatedAtomWithMachine = React.useMemo(
    () =>
      atomWithMachine(
        generateMachine({
          name: props.name,
          schemas: props.schemas,
          steps: props.steps,
        }),
      ),
    [props.name, props.steps, props.schemas],
  );
  const [state, send] = useAtom(generatedAtomWithMachine);

  const schema = React.useMemo(
    () => state.meta[`${props.name}.${state.value}`]?.schema,
    [props.name, state.meta, state.value],
  );

  const goToNextStep = (values?: unknown) => {
    send({ type: 'next', values });
  };

  const goToPreviousStep = () => {
    send({ type: 'back' });
  };

  const restart = () => {
    send(RESTART);
  };

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return (
    <WizardContext.Provider
      value={{
        currentStep: state.value as TStepName,
        goToNextStep: form.handleSubmit(goToNextStep),
        goToPreviousStep,
        restart,
        schema: state.meta.schema,
      }}
    >
      <FormProvider {...form}>{props.children}</FormProvider>
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
