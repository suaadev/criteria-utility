import { Visitor } from './visitor.js';

export type LiteralValue = number | string | boolean | null;

export type NodeLogicalOperator = '&&' | '||';

export type NodeComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export interface Node {
  kind: string;
  accept: <K = void>(visitor: Visitor<K>) => K;
}

export interface LiteralNode extends Node {
  kind: 'LiteralNode';
  value: LiteralValue;
}

export interface NotNode extends Node {
  kind: 'NotNode';
  expression: LogicalNode | ComparisonNode | FieldNode | InNode | NotNode;
}

export interface ComparisonNode extends Node {
  kind: 'ComparisonNode';
  left: ExpressionNode;
  operator: NodeComparisonOperator;
  right: ExpressionNode;
}

export interface FieldNode extends Node {
  kind: 'FieldNode';
  value: string;
}

export interface ArrayNode extends Node {
  kind: 'ArrayNode';
  items: readonly (LiteralNode | FieldNode | ArrayNode)[];
}

export interface InNode extends Node {
  kind: 'InNode';
  value: FieldNode | LiteralNode;
  arrayExpression: ArrayNode;
}

export interface LogicalNode extends Node {
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
