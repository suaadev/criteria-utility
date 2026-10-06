export type LogicOperatorRaw = 'and' | 'or';

export type ComparisonOperatorsRaw =
  'equals' | 'diff' | 'gt' | 'lt' | 'gte' | 'lte';

export type LiteralExpressionRaw = number | boolean | null | string;

export type ComparisonExpressionRightRaw<T> = Partial<{
  [K_ in ComparisonOperatorsRaw]: ExpressionRaw<T>;
}>;

export type ComparisonExpressionRaw<T> = Partial<{
  [Key in keyof T]: ComparisonExpressionRightRaw<T>;
}>;

export type ArrayExpressionRaw = (LiteralExpressionRaw | ArrayExpressionRaw)[];

export type InExpressionRightRaw = {
  in: ArrayExpressionRaw;
};

export type InExpressionRaw<T> = Partial<{
  [Key in keyof T]: InExpressionRightRaw;
}>;

export type ConditionalRaw<T> = Partial<{
  [Key in LogicOperatorRaw]: ExpressionRaw<T>[];
}>;

export type NotExpressionRaw<T> = {
  not: ExpressionRaw<T>;
};

export type ExpressionRaw<T = Record<string, unknown>> =
  | NotExpressionRaw<T>
  | ConditionalRaw<T>
  | ComparisonExpressionRaw<T>
  | InExpressionRaw<T>
  | LiteralExpressionRaw
  | ArrayExpressionRaw;
