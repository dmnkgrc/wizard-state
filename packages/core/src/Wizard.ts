import { WritableAtom, getDefaultStore } from 'jotai';
import { RESTART, atomWithMachine } from 'jotai-xstate';
import {
  BaseActionObject,
  InterpreterFrom,
  Prop,
  StateFrom,
  StateMachine,
  Typestate,
} from 'xstate';
import { z } from 'zod';

import { generateMachine } from './generateMachine';
import { Steps } from './types';

type TMachine<TValues> = StateMachine<
  TValues,
  any,
  Event,
  Typestate<TValues>,
  BaseActionObject
>;
type MaybeParam<T> = T extends (v: infer V) => unknown ? V : never;

export class Wizard<
  TStepName extends string,
  TSchema extends z.ZodTypeAny,
  TValues = z.infer<TSchema>
> {
  private _store: ReturnType<typeof getDefaultStore>;
  private _schema: z.ZodTypeAny;
  private _machineAtom: WritableAtom<
    StateFrom<TMachine<TValues>>,
    [
      | MaybeParam<Prop<InterpreterFrom<TMachine<TValues>>, 'send'>>
      | typeof RESTART
    ],
    void
  >;
  constructor(name: string, steps: Steps<TStepName>, schema: TSchema) {
    this._store = getDefaultStore();
    this._schema = schema;
    // @ts-expect-error jotai complains about types not being compatible
    this._machineAtom = atomWithMachine(() =>
      generateMachine<TStepName, TValues>({
        name,
        steps,
      })
    );
  }

  getSchema() {
    return this._schema;
  }

  nextStep() {
    this._store.set(this._machineAtom, 'next');
  }

  previousStep() {
    this._store.set(this._machineAtom, 'back');
  }

  getCurrentStep() {
    return this._store.get(this._machineAtom).value;
  }

  sub(listener: () => void) {
    return this._store.sub(this._machineAtom, listener);
  }
}
