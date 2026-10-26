export type LiteralValue = number | string | boolean | null;

export type NodeLogicalOperator = '&&' | '||';

export type NodeComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export interface LiteralNode {
  kind: 'LiteralNode';
  value: LiteralValue;
}

export interface NotNode {
  kind: 'NotNode';
  expression: LogicalNode | ComparisonNode | FieldNode | InNode | NotNode;
}

export interface ComparisonNode {
  kind: 'ComparisonNode';
  left: ExpressionNode;
  operator: NodeComparisonOperator;
  right: ExpressionNode;
}

export interface FieldNode {
  kind: 'FieldNode';
  value: string;
}

export interface ArrayNode {
  kind: 'ArrayNode';
  items: readonly (LiteralNode | FieldNode | ArrayNode)[];
}

export interface InNode {
  kind: 'InNode';
  value: FieldNode | LiteralNode;
  arrayExpression: ArrayNode;
}

export interface LogicalNode {
  kind: 'LogicalNode';
  left: LogicalNode | ComparisonNode | InNode | NotNode | FieldNode;
  operator: NodeLogicalOperator;
  right: LogicalNode | ComparisonNode | InNode | NotNode | FieldNode;
}

export type ExpressionNode =
  | LiteralNode
  | FieldNode
  | LogicalNode
  | ComparisonNode
  | InNode
  | NotNode
  | ArrayNode;
