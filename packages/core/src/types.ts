import { ZodTypeAny, z } from 'zod';

export type NoInfer<T> = [T][T extends any ? 0 : never];

export type UnionToIntersectionSchema<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type ValuesFromSchemas<
  TSchemas extends Partial<Record<string, ZodTypeAny>>,
> = z.infer<
  // @ts-expect-error zod will correctly infer the type
  UnionToIntersectionSchema<Exclude<TSchemas[keyof TSchemas], undefined>>
>;

export type Step<TStepName extends string> = {
  name: TStepName;
};

export type Steps<TStepName extends string> = [
  Step<TStepName>,
  ...Step<TStepName>[],
];

export type Event =
  | {
      type: 'next';
      values?: unknown;
    }
  | {
      type: 'back';
    };
