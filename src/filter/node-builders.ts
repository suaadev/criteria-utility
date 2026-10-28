import * as ast from './ast.js';
import { Visitor } from './visitor.js';

export function buildLiteralNode(value: ast.LiteralValue): ast.LiteralNode {
  const obj: ast.LiteralNode = {
    kind: 'LiteralNode',
    value,
    accept: <T>(visitor: Visitor<T>) => visitor.visitLiteralNode(obj),
  };
  return Object.freeze(obj);
}

export function buildComparisonNode(
  left: ast.ExpressionNode,
  operator: ast.NodeComparisonOperator,
  right: ast.ExpressionNode,
): ast.ComparisonNode {
  const obj: ast.ComparisonNode = {
    kind: 'ComparisonNode',
    left,
    operator,
    right,
    accept: <T>(visitor: Visitor<T>) => visitor.visitComparisonNode(obj),
  };
  return Object.freeze(obj);
}

export function buildLogicalNode(
  left: ast.LogicalNode['left'],
  operator: ast.NodeLogicalOperator,
  right: ast.LogicalNode['right'],
): ast.LogicalNode {
  const obj: ast.LogicalNode = {
    kind: 'LogicalNode',
    left,
    operator,
    right,
    accept: <T>(visitor: Visitor<T>) => visitor.visitLogicalNode(obj),
  };
  return Object.freeze(obj);
}

export function buildNotNode(
  expression: ast.NotNode['expression'],
): ast.NotNode {
  const obj: ast.NotNode = {
    kind: 'NotNode',
    expression,
    accept: <T>(visitor: Visitor<T>) => visitor.visitNotNode(obj),
  };
  return Object.freeze(obj);
}

export function buildArrayNode(items: ast.ArrayNode['items']): ast.ArrayNode {
  const obj: ast.ArrayNode = {
    kind: 'ArrayNode',
    items: Object.freeze(items),
    accept: <T>(visitor: Visitor<T>) => visitor.visitArrayNode(obj),
  };
  return Object.freeze(obj);
}

export function buildInNode(
  value: ast.InNode['value'],
  arrayExpression: ast.ArrayNode,
): ast.InNode {
  const obj: ast.InNode = {
    kind: 'InNode',
    arrayExpression,
    value,
    accept: <T>(visitor: Visitor<T>) => visitor.visitInNode(obj),
  };
  return Object.freeze(obj);
}

export function buildFieldNode(value: string): ast.FieldNode {
  const obj: ast.FieldNode = {
    kind: 'FieldNode',
    value,
    accept: <T>(visitor: Visitor<T>) => visitor.visitFieldNode(obj),
  };
  return Object.freeze(obj);
}
