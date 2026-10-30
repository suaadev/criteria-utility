import * as Ast from './ast.js';
import { Visitor } from './visitor.js';

export function buildLiteralNode(value: Ast.LiteralValue): Ast.LiteralNode {
  const obj: Ast.LiteralNode = {
    kind: 'LiteralNode',
    value,
    accept: <T>(visitor: Visitor<T>) => visitor.visitLiteralNode(obj),
  };
  return Object.freeze(obj);
}

export function buildComparisonNode(
  left: Ast.ExpressionNode,
  operator: Ast.NodeComparisonOperator,
  right: Ast.ExpressionNode,
): Ast.ComparisonNode {
  const obj: Ast.ComparisonNode = {
    kind: 'ComparisonNode',
    left,
    operator,
    right,
    accept: <T>(visitor: Visitor<T>) => visitor.visitComparisonNode(obj),
  };
  return Object.freeze(obj);
}

export function buildLogicalNode(
  left: Ast.LogicalNode['left'],
  operator: Ast.NodeLogicalOperator,
  right: Ast.LogicalNode['right'],
): Ast.LogicalNode {
  const obj: Ast.LogicalNode = {
    kind: 'LogicalNode',
    left,
    operator,
    right,
    accept: <T>(visitor: Visitor<T>) => visitor.visitLogicalNode(obj),
  };
  return Object.freeze(obj);
}

export function buildNotNode(
  expression: Ast.NotNode['expression'],
): Ast.NotNode {
  const obj: Ast.NotNode = {
    kind: 'NotNode',
    expression,
    accept: <T>(visitor: Visitor<T>) => visitor.visitNotNode(obj),
  };
  return Object.freeze(obj);
}

export function buildArrayNode(items: Ast.ArrayNode['items']): Ast.ArrayNode {
  const obj: Ast.ArrayNode = {
    kind: 'ArrayNode',
    items: Object.freeze(items),
    accept: <T>(visitor: Visitor<T>) => visitor.visitArrayNode(obj),
  };
  return Object.freeze(obj);
}

export function buildInNode(
  value: Ast.InNode['value'],
  arrayExpression: Ast.ArrayNode,
): Ast.InNode {
  const obj: Ast.InNode = {
    kind: 'InNode',
    arrayExpression,
    value,
    accept: <T>(visitor: Visitor<T>) => visitor.visitInNode(obj),
  };
  return Object.freeze(obj);
}

export function buildFieldNode(value: string): Ast.FieldNode {
  const obj: Ast.FieldNode = {
    kind: 'FieldNode',
    value,
    accept: <T>(visitor: Visitor<T>) => visitor.visitFieldNode(obj),
  };
  return Object.freeze(obj);
}

export function buildIsNullNode(
  isNull: boolean,
  value: Ast.IsNullNode['value'],
): Ast.IsNullNode {
  const obj: Ast.IsNullNode = {
    kind: 'IsNullNode',
    isNull,
    value,
    accept: <T>(visitor: Visitor<T>) => visitor.visitIsNullNode(obj),
  };
  return Object.freeze(obj);
}

export function buildBetweenNode(
  value: Ast.BetweenNode['value'],
  start: Ast.BetweenNode['start'],
  end: Ast.BetweenNode['end'],
): Ast.BetweenNode {
  const obj: Ast.BetweenNode = {
    kind: 'BetweenNode',
    value,
    end,
    start,
    accept: <T>(visitor: Visitor<T>) => visitor.visitBetweenNode(obj),
  };
  return Object.freeze(obj);
}
