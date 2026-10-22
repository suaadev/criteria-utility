export type LiteralExpressionValids = number | string | boolean | null;

export type LogicalOperator = '&&' | '||';

export type ComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export interface LiteralExpression {
  kind: 'LiteralExpression';
  value: LiteralExpressionValids;
}

export interface NotExpression {
  kind: 'NotExpression';
  expression:
    | LogicExpression
    | ComparisonExpression
    | FieldExpression
    | InExpression
    | NotExpression;
}

export interface ComparisonExpression {
  kind: 'ComparisonExpression';
  left: Expression;
  operator: ComparisonOperator;
  right: Expression;
}

export interface FieldExpression {
  kind: 'FieldExpression';
  value: string;
}

export interface ArrayExpression {
  kind: 'ArrayExpression';
  items: (LiteralExpression | FieldExpression | ArrayExpression)[];
}

export interface InExpression {
  kind: 'InExpression';
  value: FieldExpression | LiteralExpression;
  arrayExpression: ArrayExpression;
}

export interface LogicExpression {
  kind: 'LogicExpression';
  left: Expression;
  operator: LogicalOperator;
  right: Expression;
}

export type Expression =
  | LiteralExpression
  | FieldExpression
  | LogicExpression
  | ComparisonExpression
  | InExpression
  | NotExpression
  | ArrayExpression;
