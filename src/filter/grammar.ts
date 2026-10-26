export type LogicalOperator = 'and' | 'or';

export type ComparisonOperator =
  'equals' | 'diff' | 'gt' | 'lt' | 'gte' | 'lte';

export type LiteralExpression = number | boolean | null | string;

export type ComparisonOperand<T> = Partial<{
  [K in ComparisonOperator]: Expression<T>;
}>;

export type ComparisonExpression<T> = Partial<{
  [Key in keyof T]: ComparisonOperand<T>;
}>;

export type ArrayExpression = (LiteralExpression | ArrayExpression)[];

export interface InOperand {
  in: ArrayExpression;
}

export type InExpression<T> = Partial<{
  [Key in keyof T]: InOperand;
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
