import { Criteria, Sort } from '../criteria.js';
import * as grammar from '../filter/grammar.js';
import * as CursorSerializer from './cursor-serializer.js';

const mapComparisonOperatorsToSql: Record<grammar.ComparisonOperator, string> =
  {
    '==': '=',
    '!=': '!=',
    '<=': '<=',
    '>=': '>=',
    '<': '<',
    '>': '>',
  };

const mapLogicperatorsToSql: Record<grammar.LogicalOperator, string> = {
  '&&': 'AND',
  '||': 'OR',
};

const validsExpInLogicExp = [
  'LiteralExpression',
  'ComparisonExpression',
  'LogicExpression',
  'NotExpression',
  'InExpression',
];

export function fromCriteria(criteria: Criteria, alias = '') {
  const { filterExpression, limit, orderBy, pagination } =
    criteria.toObjectPlain();

  const valuesParams: unknown[] = [];

  const whereStatments: string[] = [];

  let orderByFields: string[] = orderBy.map(
    ([field, sort]) => `${buildFieldWithAlias(field, alias)} ${sort}`,
  );

  if (filterExpression) {
    whereStatments.push(expressionToSql(filterExpression, alias, valuesParams));
  }

  let offsetStatement = '';

  let limitStatment = '';

  if (Number.isFinite(limit)) {
    if (pagination && typeof pagination.cursor === 'string') {
      const fields = CursorSerializer.decode(pagination.cursor);

      orderByFields = [];

      const fieldsWithParams: [string, string, string][] = [];

      for (const [fieldName, operator, value] of fields) {
        const fieldNameWithAlias = buildFieldWithAlias(fieldName, alias);

        valuesParams.push(value);

        fieldsWithParams.push([
          fieldNameWithAlias,
          operator,
          `$${valuesParams.length}`,
        ]);

        orderByFields.push(`${fieldNameWithAlias} ${resolveSort(operator)}`);
      }

      const lastCombination: [string, string, string][] = [fieldsWithParams[0]];

      const output: string[] = [fieldsWithParams[0].join(' ')];

      for (const currentField of fieldsWithParams) {
        const lastField = lastCombination[lastCombination.length - 1];

        lastField[1] = '=';

        lastCombination.push(currentField);

        output.push(
          `(${lastCombination.map((m) => m.join(' ')).join(' AND ')})`,
        );
      }

      whereStatments.push(`(${output.join(' OR ')})`);
    } else if (pagination && Number.isFinite(pagination.page)) {
      offsetStatement = `OFFSET ${(limit as number) * ((pagination.page as number) - 1)}`;
    }

    limitStatment = `LIMIT ${limit}`;
  }

  const outputSql: string = [
    whereStatments.join(' AND '),
    orderByFields.length > 0 ? `ORDER BY ${orderByFields.join(', ')}` : '',
    offsetStatement,
    limitStatment,
  ]
    .join(' ')
    .trim();

  return {
    sql: outputSql,
    values: valuesParams,
  };
}

function resolveSort(operator: string): Sort {
  return operator == '>' ? 'ASC' : 'DESC';
}

function buildFieldWithAlias(field: string, alias = '') {
  return `${alias.trim() === '' ? '' : `${alias}.`}"${field}"`.trim();
}

function validateOperandInLogicExp(
  type: 'left' | 'right',
  expression: grammar.Expression,
) {
  if (!validsExpInLogicExp.includes(expression.kind)) {
    throw new SyntaxError(
      `Invalid ${type} operand in LogicExpression: expected (${validsExpInLogicExp.join(', ')}), received: ${expression.kind}`,
    );
  }

  if (
    expression.kind === 'LiteralExpression' &&
    typeof expression.value != 'boolean'
  ) {
    throw new SyntaxError(
      `Invalid ${type} operand in LogicExpression: expected boolean for LiteralExpression, received ${typeof expression.value} (${expression.value})`,
    );
  }
}

function expressionToSql(
  expression: grammar.Expression,
  alias = '',
  valuesParams: unknown[],
): string {
  if (expression.kind === 'LiteralExpression') {
    valuesParams.push(expression.value);
    return `$${valuesParams.length}`;
  }

  if (expression.kind === 'FieldExpression') {
    return buildFieldWithAlias(expression.value, alias);
  }

  if (expression.kind === 'ComparisonExpression') {
    const leftExpression: string = expressionToSql(
      expression.left,
      alias,
      valuesParams,
    );

    const rightExpression: string = expressionToSql(
      expression.right,
      alias,
      valuesParams,
    );

    return `(${leftExpression} ${mapComparisonOperatorsToSql[expression.operator]} ${rightExpression})`;
  }

  if (expression.kind === 'LogicExpression') {
    validateOperandInLogicExp('left', expression.left);

    validateOperandInLogicExp('right', expression.right);

    const leftExpression: string = expressionToSql(
      expression.left,
      alias,
      valuesParams,
    );

    const rightExpression: string = expressionToSql(
      expression.right,
      alias,
      valuesParams,
    );

    return `(${leftExpression} ${mapLogicperatorsToSql[expression.operator]} ${rightExpression})`;
  }

  if (expression.kind === 'NotExpression') {
    if (
      expression.expression.kind === 'LiteralExpression' &&
      typeof expression.expression.value != 'boolean'
    ) {
      throw new SyntaxError(
        `Invalid operand in NotExpression: expected boolean, received ${typeof expression.expression.value} (${expression.expression.value})`,
      );
    }
    const expr: string = expressionToSql(
      expression.expression,
      alias,
      valuesParams,
    );

    return `(NOT ${expr})`;
  }

  if (expression.kind === 'ArrayExpression') {
    const expr: string[] = [];
    for (const itemExpression of expression.items) {
      expr.push(expressionToSql(itemExpression, alias, valuesParams));
    }
    return ` (${expr.join(', ')})`;
  }

  if (expression.kind === 'InExpression') {
    const value = expressionToSql(expression.value, alias, valuesParams);
    const arrayExpression = expressionToSql(
      expression.arrayExpression,
      alias,
      valuesParams,
    );

    return `(${value} IN ${arrayExpression})`;
  }

  const unsupportedKind = (expression as { kind?: string }).kind ?? 'unknown';

  throw new Error(
    `Unsupported expression kind for SQL generation: '${unsupportedKind}' (${JSON.stringify(expression)})`,
  );
}
