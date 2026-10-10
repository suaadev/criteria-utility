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

const mapLogicOperatorsToSql: Record<grammar.LogicalOperator, string> = {
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

  const whereStatements: string[] = [];

  let orderByFields: string[] = orderBy.map(
    ([field, sort]) => `${buildFieldWithAlias(field, alias)} ${sort}`,
  );

  if (filterExpression) {
    whereStatements.push(
      expressionToSql(filterExpression, alias, valuesParams),
    );
  }

  let offset: number | null = null;

  if (Number.isFinite(limit) && pagination) {
    if (typeof pagination.cursor === 'string') {
      const cursorStatements = buildCursorStatements(
        pagination.cursor,
        valuesParams,
        alias,
      );
      orderByFields = cursorStatements.orderByFields;
      whereStatements.push(cursorStatements.where);
    } else if (Number.isFinite(pagination.page)) {
      offset = ((pagination.page as number) - 1) * (limit as number);
    }
  }

  const whereStatement: string = whereStatements.join(' AND ');

  const orderByStatement: string = orderByFields.join(', ');

  const fullSql: string = [
    whereStatements.length > 0 ? 'WHERE' : '',
    whereStatement,
    orderByFields.length > 0 ? `ORDER BY ${orderByStatement}` : '',
    Number.isFinite(offset) ? `OFFSET ${offset}` : '',
    Number.isFinite(limit) ? `LIMIT ${limit}` : '',
  ]
    .join(' ')
    .trim();

  return {
    fullSql,
    sql: {
      where: whereStatement,
      orderBy: orderByStatement,
      offset,
      limit,
    },
    values: valuesParams,
  };
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

    return `(${leftExpression} ${mapLogicOperatorsToSql[expression.operator]} ${rightExpression})`;
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

function buildCursorStatements(
  cursor: string,
  valuesParams: unknown[],
  alias = '',
) {
  const fields = CursorSerializer.decode(cursor);

  const orderByFields = [];

  const fieldsWithParams: [string, string, string][] = [];

  for (const [fieldName, value, sort] of fields) {
    const fieldNameWithAlias = buildFieldWithAlias(fieldName, alias);

    valuesParams.push(value);

    fieldsWithParams.push([
      fieldNameWithAlias,
      resolveOperator(sort),
      `$${valuesParams.length}`,
    ]);

    orderByFields.push(`${fieldNameWithAlias} ${sort}`);
  }

  const lastCombination: [string, string, string][] = [fieldsWithParams[0]];

  const output: string[] = [fieldsWithParams[0].join(' ')];

  for (const currentField of fieldsWithParams.slice(1)) {
    const lastField = lastCombination[lastCombination.length - 1];

    lastField[1] = '=';

    lastCombination.push(currentField);

    output.push(`(${lastCombination.map((m) => m.join(' ')).join(' AND ')})`);
  }

  return { where: `(${output.join(' OR ')})`, orderByFields };
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

function resolveOperator(operator: Sort): '>' | '<' {
  return operator === 'ASC' ? '>' : '<';
}

function buildFieldWithAlias(field: string, alias = '') {
  return `${alias.trim() === '' ? '' : `${alias}.`}"${field}"`.trim();
}
