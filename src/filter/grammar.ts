export type LogicalOperator = 'and' | 'or';

export type ComparisonOperator =
  'equals' | 'diff' | 'gt' | 'lt' | 'gte' | 'lte';

export type FieldExpression = `$${string}`;

export type LiteralExpression = number | boolean | null | string;

export type ComparisonOperand<T> = Partial<Record<ComparisonOperator, T>>;

export type ComparisonExpression<T> = Partial<{
  [K in keyof T]: ComparisonOperand<
    T extends object ? T[K] | FieldExpression : Expression<T>
  >;
}>;

export type ArrayExpression = (LiteralExpression | ArrayExpression)[];

export interface InOperand {
  in: ArrayExpression;
}

export type InExpression<T> = Partial<{
  [K in keyof T]: InOperand;
}>;

export type LogicalExpression<T> = Partial<
  Record<
    LogicalOperator,
    (
      | LogicalExpression<T>
      | ComparisonExpression<T>
      | InExpression<T>
      | NotExpression<T>
    )[]
  >
>;

export interface NotExpression<T> {
  not:
    | LogicalExpression<T>
    | ComparisonExpression<T>
    | InExpression<T>
    | NotExpression<T>;
}

export type Expression<T = Record<string, unknown>> =
  | NotExpression<T>
  | LogicalExpression<T>
  | ComparisonExpression<T>
  | InExpression<T>
  | LiteralExpression
  | ArrayExpression;
