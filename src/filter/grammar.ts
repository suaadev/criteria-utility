export type LiteralExpressionValids = number | string | boolean | null;

export type LogicalOperator = '&&' | '||';

export type ComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export type LiteralExpression = {
  kind: 'LiteralExpression';
  value: LiteralExpressionValids;
};

export type NotExpression = {
  kind: 'NotExpression';
  expression: Expression;
};

export type ComparisonExpression = {
  kind: 'ComparisonExpression';
  left: Expression;
  operator: ComparisonOperator;
  right: Expression;
};

export type FieldExpression = {
  kind: 'FieldExpression';
  value: string;
};

export type ArrayExpression = {
  kind: 'ArrayExpression';
  items: (LiteralExpression | FieldExpression | ArrayExpression)[];
};

export type InExpression = {
  kind: 'InExpression';
  value: FieldExpression | LiteralExpression;
  arrayExpression: ArrayExpression;
};

export type LogicExpression = {
  kind: 'LogicExpression';
  left: Expression;
  operator: LogicalOperator;
  right: Expression;
};

export type Expression =
  | LiteralExpression
  | FieldExpression
  | LogicExpression
  | ComparisonExpression
  | InExpression
  | NotExpression
  | ArrayExpression;
