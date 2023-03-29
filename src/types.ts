type NoInfer<T> = [T][T extends any ? 0 : never];

export type Step<TStepName extends string> = {
  name: string;
  previous?: TStepName;
  next?: TStepName;
}

export type Steps<TStepName extends string> = {
  [stepName in TStepName]: Step<NoInfer<TStepName>>;
}
