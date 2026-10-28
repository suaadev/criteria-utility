import InvalidExpression from '../exceptions/invalid-expression.js';
import * as ast from './ast.js';
import {
  buildArrayNode,
  buildComparisonNode,
  buildFieldNode,
  buildInNode,
  buildLiteralNode,
  buildLogicalNode,
  buildNotNode,
} from './node-builders.js';
import * as grammar from './grammar.js';

const mapComparisonOperator: Record<
  grammar.ComparisonOperator,
  ast.NodeComparisonOperator
> = {
  equals: '==',
  diff: '!=',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=',
};

const mapLogicalOperator: Record<
  grammar.LogicalOperator,
  ast.NodeLogicalOperator
> = {
  and: '&&',
  or: '||',
};

const idExpressionRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function parse<T>(input: grammar.Expression<T>): ast.ExpressionNode {
  // Field expressions
  if (typeof input === 'string' && input.charAt(0) === '$') {
    const field: string = input.slice(1);
    validateFieldExpression(field);
    return buildFieldNode(field);
  }

  // Literal expressions
  if (
    input === null ||
    ['string', 'number', 'boolean'].includes(typeof input)
  ) {
    return buildLiteralNode(input as grammar.LiteralExpression);
  }

  // Array Expression
  if (Array.isArray(input)) {
    const items = [];

    for (const item of input) {
      const expression = parse(item);
      if (
        expression.kind !== 'LiteralNode' &&
        expression.kind !== 'FieldNode' &&
        expression.kind !== 'ArrayNode'
      ) {
        throw new InvalidExpression(
          'The Array expression requires a LiteralExpression, ArrayExpression, or FieldExpression',
          input,
        );
      }
      items.push(expression);
    }
    return buildArrayNode(items);
  }

  if (typeof input != 'object') {
    throw new InvalidExpression('Invalid input', input);
  }

  const keys = Object.keys(input);

  if (keys.length != 1) {
    throw new InvalidExpression(
      'Object is not valid; it must contain only one key',
      input,
    );
  }

  const key = keys[0];

  // Logic operators

  if (key === 'and' || key === 'or') {
    const expressionsInput = (input as grammar.LogicalExpression<T>)[key];

    if (!Array.isArray(expressionsInput))
      throw new InvalidExpression(
        `The Logic expression must be an array of expressions.`,
        input,
      );

    if (expressionsInput.length <= 1) {
      throw new InvalidExpression(
        'The Logic expression must contain at least two arguments.',
        input,
      );
    }

    const expressions: ast.LogicalNode['left'][] = [];

    for (const expressionInput of expressionsInput) {
      const expression = parse(expressionInput);
      if (
        expression.kind !== 'LogicalNode' &&
        expression.kind !== 'ComparisonNode' &&
        expression.kind !== 'InNode' &&
        expression.kind !== 'NotNode' &&
        expression.kind !== 'FieldNode'
      ) {
        throw new InvalidExpression(
          'The LogicExpression requires valid expressions',
          input,
        );
      }
      expressions.push(expression);
    }

    return expressions.reduce((le, re) =>
      buildLogicalNode(le, mapLogicalOperator[key], re),
    );
  }

  // Not expression

  if (key === 'not') {
    const expressionInput = (input as grammar.NotExpression<T>)['not'];

    const expression: ast.ExpressionNode = parse(expressionInput);

    if (
      expression.kind !== 'FieldNode' &&
      expression.kind !== 'ComparisonNode' &&
      expression.kind !== 'LogicalNode' &&
      expression.kind !== 'NotNode' &&
      expression.kind !== 'InNode'
    ) {
      throw new InvalidExpression(
        `The NOT expression requires a valid expression`,
        input,
      );
    }

    return buildNotNode(expression);
  }

  validateFieldExpression(key);

  const field = key as keyof T;

  const operation = (
    input as Record<
      keyof T,
      Partial<grammar.InOperand & grammar.ComparisonOperand<T>>
    >
  )[field];

  const keysOperation = Object.keys(operation);

  if (keysOperation.length !== 1) {
    throw new InvalidExpression('The field requires an operand', input);
  }

  const operator: string = keysOperation[0];

  // Comparison operators
  if (
    operator === 'equals' ||
    operator === 'diff' ||
    operator === 'gt' ||
    operator === 'lt' ||
    operator === 'gte' ||
    operator === 'lte'
  ) {
    const expressionInput = operation[operator];

    return buildComparisonNode(
      buildFieldNode(key),
      mapComparisonOperator[operator],
      parse(expressionInput ?? null),
    );
  }

  // In expression
  if (operator === 'in') {
    const arrayInput = operation[operator];

    if (!Array.isArray(arrayInput) || arrayInput.length === 0) {
      throw new InvalidExpression(
        'The Array expression in IN expression must contain at least one item',
        input,
      );
    }

    const arrayNode = parse(arrayInput);

    if (arrayNode.kind !== 'ArrayNode') {
      throw new InvalidExpression(
        'The IN expression must contain an array of literal or field expressions.',
        arrayNode,
      );
    }

    return buildInNode(buildFieldNode(key), arrayNode);
  }

  throw new InvalidExpression('The input expression is invalid', input);
}

function validateFieldExpression(field: string) {
  if (!idExpressionRegex.test(field)) {
    throw new InvalidExpression(
      `The field expression provided is invalid`,
      field,
    );
  }
}
