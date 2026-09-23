export type LogicOperatorRaw = "and" | "or";

export type ComparisonOperatorsRaw =
  | "equals"
  | "diff"
  | "gt"
  | "lt"
  | "gte"
  | "lte";

export type LiteralExpressionRaw = number | string | boolean;

export type IdExpressionRaw = string;

export type ComparisonRaw = Partial<{
  [key in ComparisonOperatorsRaw]: (ExpressionRaw | LiteralExpressionRaw)[];
}>;

export type ConditionalRaw = Partial<{
  [Key in LogicOperatorRaw]: (LiteralExpressionRaw | ExpressionRaw)[];
}>;

export type InExpressionRaw = Partial<{
  in: [LiteralExpressionRaw, LiteralExpressionRaw[]];
}>;

export type NotExpressionRaw = {
  not:
    | ConditionalRaw
    | ComparisonRaw
    | LiteralExpressionRaw
    | NotExpressionRaw
    | InExpressionRaw;
};

export type ExpressionRaw =
  | NotExpressionRaw
  | ConditionalRaw
  | ComparisonRaw
  | InExpressionRaw;
