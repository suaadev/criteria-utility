import InvalidExpression from '../exceptions/invalid-expression.js';
import * as basicGrammar from './basic-grammar.js';
import * as grammar from './grammar.js';

const mapRawComparisonOperator: Record<
  basicGrammar.ComparisonOperatorsRaw,
  grammar.ComparisonOperator
> = {
  equals: '==',
  diff: '!=',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=',
};

const mapLogicOperator: Record<
  basicGrammar.LogicOperatorRaw,
  grammar.LogicalOperator
> = {
  and: '&&',
  or: '||',
};

const idExpressionRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function parse<T>(
  input: basicGrammar.ExpressionRaw<T>,
): grammar.Expression {
  // Field expressions
  if (typeof input === 'string' && input.charAt(0) === '$') {
    const field: string = input.slice(1);
    validateFieldExpression(field);
    return buildFieldExpression(field);
  }

  // Literal expressions
  if (
    input === null ||
    ['string', 'number', 'boolean'].includes(typeof input)
  ) {
    return buildLiteralExpression(input as basicGrammar.LiteralExpressionRaw);
  }

  // Array Expression
  if (Array.isArray(input)) {
    const items: grammar.ArrayExpression['items'] = [];

    for (const item of input) {
      const expression = parse(item);
      if (
        expression.kind !== 'LiteralExpression' &&
        expression.kind !== 'FieldExpression' &&
        expression.kind !== 'ArrayExpression'
      ) {
        throw new InvalidExpression(
          'The Array expression requires a LiteralExpression, ArrayExpression, or FieldExpression',
          input,
        );
      }
      items.push(expression);
    }
    return buildArrayExpression(items);
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
    const expressionsRaw = (input as basicGrammar.ConditionalRaw<T>)[key];

    if (!Array.isArray(expressionsRaw))
      throw new InvalidExpression(
        `The Logic expression must be an array of expressions.`,
        input,
      );

    if (expressionsRaw.length <= 1) {
      throw new InvalidExpression(
        'The Logic expression must contain at least two arguments.',
        input,
      );
    }

    const expressions: grammar.LogicExpression['left'][] = [];

    for (const expressionRaw of expressionsRaw) {
      const expression = parse(expressionRaw);
      if (
        expression.kind !== 'LogicExpression' &&
        expression.kind !== 'ComparisonExpression' &&
        expression.kind !== 'InExpression' &&
        expression.kind !== 'NotExpression' &&
        expression.kind !== 'FieldExpression'
      ) {
        throw new InvalidExpression(
          'The LogicExpression requires valid expressions',
          input,
        );
      }
      expressions.push(expression);
    }

    return appendExpressions(expressions, (le, re) =>
      buildLogicExpression(le, mapLogicOperator[key], re),
    );
  }

  // Not expression

  if (key === 'not') {
    const expressionsRaw = (input as basicGrammar.NotExpressionRaw<T>)['not'];

    const expression: grammar.Expression = parse(expressionsRaw);

    if (
      expression.kind !== 'FieldExpression' &&
      expression.kind !== 'ComparisonExpression' &&
      expression.kind !== 'LogicExpression' &&
      expression.kind !== 'NotExpression' &&
      expression.kind !== 'InExpression'
    ) {
      throw new InvalidExpression(
        `The NOT expression requires a valid expression`,
        input,
      );
    }

    return buildNotExpression(expression);
  }

  validateFieldExpression(key);

  const field = key as keyof T;

  const operation = (
    input as Record<
      keyof T,
      Partial<
        basicGrammar.InExpressionRightRaw &
          basicGrammar.ComparisonExpressionRightRaw<T>
      >
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
    const expressionsRaw = operation[operator];

    return buildComparisonExpression(
      buildFieldExpression(key),
      mapRawComparisonOperator[operator],
      parse(expressionsRaw ?? null),
    );
  }

  // In expression
  if (operator === 'in') {
    const arrayRaw = operation[operator];

    if (!Array.isArray(arrayRaw) || arrayRaw.length === 0) {
      throw new InvalidExpression(
        'The Array expression in IN expression must contain at least one item',
        input,
      );
    }

    const arrayExpression = parse(arrayRaw);

    if (arrayExpression.kind !== 'ArrayExpression') {
      throw new InvalidExpression(
        'The IN expression must contain an array of literal or field expressions.',
        arrayExpression,
      );
    }

    return buildInExpression(buildFieldExpression(key), arrayExpression);
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

function buildLiteralExpression(
  value: grammar.LiteralExpressionValids,
): grammar.LiteralExpression {
  return { kind: 'LiteralExpression', value };
}

function buildComparisonExpression(
  left: grammar.Expression,
  operator: grammar.ComparisonOperator,
  right: grammar.Expression,
): grammar.ComparisonExpression {
  return { kind: 'ComparisonExpression', left, operator, right };
}

function buildLogicExpression(
  left: grammar.LogicExpression['left'],
  operator: grammar.LogicalOperator,
  right: grammar.LogicExpression['right'],
): grammar.LogicExpression {
  return { kind: 'LogicExpression', left, operator, right };
}

function buildNotExpression(
  expression: grammar.NotExpression['expression'],
): grammar.NotExpression {
  return { kind: 'NotExpression', expression };
}

function buildArrayExpression(
  items: grammar.ArrayExpression['items'],
): grammar.ArrayExpression {
  return {
    kind: 'ArrayExpression',
    items,
  };
}

function buildInExpression(
  value: grammar.InExpression['value'],
  arrayExpression: grammar.ArrayExpression,
): grammar.InExpression {
  return { kind: 'InExpression', arrayExpression, value };
}

function buildFieldExpression(value: string): grammar.FieldExpression {
  return { kind: 'FieldExpression', value };
}

function appendExpressions<T>(
  expressionsToAppend: T[],
  builder: (lastExpression: T, currentExpression: T) => T,
) {
  let lastExpression: T = expressionsToAppend[0];

  for (let i = 1; i < expressionsToAppend.length; i++) {
    const expressionToAppend = expressionsToAppend[i];

    lastExpression = builder(lastExpression, expressionToAppend);
  }
  return lastExpression;
}
