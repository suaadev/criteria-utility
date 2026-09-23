export type LiteralExpressionValids = number | string | boolean;

export type LogicalOperator = "&&" | "||";

export type ComparisonOperator = "==" | "!=" | ">" | "<" | ">=" | "<=";

export type LiteralExpression = {
  kind: "LiteralExpression";
  value: LiteralExpressionValids;
};

export type NotExpression = {
  kind: "NotExpression";
  expression: Expression;
};

export type ComparisonExpression = {
  kind: "ComparisonExpression";
  left: Expression;
  operator: ComparisonOperator;
  right: Expression;
};

export type IdExpression = {
  kind: "IdExpression";
  value: string;
};

export type InExpression = {
  kind: "InExpression";
  value: LiteralExpression | IdExpression;
  expression: LiteralExpression[];
};

export type LogicExpression = {
  kind: "LogicExpression";
  left: Expression;
  operator: LogicalOperator;
  right: Expression;
};

export type Expression =
  | LiteralExpression
  | IdExpression
  | LogicExpression
  | ComparisonExpression
  | InExpression
  | NotExpression;
