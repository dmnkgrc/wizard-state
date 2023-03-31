export type NoInfer<T> = [T][T extends any ? 0 : never];

export type Step<TStepName extends string> = {
  name: TStepName;
  previous?: NoInfer<TStepName>;
};

export type Steps<TStepName extends string> = [
  Step<TStepName>,
  ...Step<TStepName>[]
];

export type Event =
  | {
      type: 'next';
    }
  | {
      type: 'back';
    };
