export type NoInfer<T> = [T][T extends any ? 0 : never];

export type UnionToIntersectionSchema<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type Step<TStepName extends string> = {
  name: TStepName;
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
