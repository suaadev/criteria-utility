import { Criteria, Sort } from '../criteria.js';
import * as grammar from '../filter/grammar.js';
import CursorSerializer from './cursor-serializer.js';

export default class PostgresSqlGenerator {
  private static mapComparisonOperatorsToSql: Record<
    grammar.ComparisonOperator,
    string
  > = {
    '==': '=',
    '!=': '!=',
    '<=': '<=',
    '>=': '>=',
    '<': '<',
    '>': '>',
  };

  private static mapLogicperatorsToSql: Record<
    grammar.LogicalOperator,
    string
  > = {
    '&&': 'AND',
    '||': 'OR',
  };

  private static validsExpInLogicExp = [
    'LiteralExpression',
    'ComparisonExpression',
    'LogicExpression',
    'NotExpression',
    'InExpression',
  ];

  static fromCriteria(criteria: Criteria, alias: string = '') {
    const { filterExpression, limit, orderBy, pagination } =
      criteria.toObjectPlain();

    const valuesParams: unknown[] = [];

    const whereStatments: string[] = [];

    let orderByFields: string[] = orderBy.map(
      ([field, sort]) => `${this.buildFieldWithAlias(field, alias)} ${sort}`,
    );

    if (filterExpression) {
      whereStatments.push(
        this.expressionToSql(filterExpression, alias, valuesParams),
      );
    }

    let offsetStatement = '';

    let limitStatment = '';

    if (Number.isFinite(limit)) {
      if (pagination && typeof pagination.cursor === 'string') {
        const fields = CursorSerializer.decode(pagination.cursor);

        orderByFields = [];

        const fieldsWithParams: [string, string, string][] = [];

        for (const [fieldName, operator, value] of fields) {
          const fieldNameWithAlias = this.buildFieldWithAlias(fieldName, alias);

          valuesParams.push(value);

          fieldsWithParams.push([
            fieldNameWithAlias,
            operator,
            `$${valuesParams.length}`,
          ]);

          orderByFields.push(
            `${fieldNameWithAlias} ${this.resolveSort(operator)}`,
          );
        }

        const lastCombination: [string, string, string][] = [
          fieldsWithParams[0],
        ];

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

  private static resolveSort(operator: string): Sort {
    return operator == '>' ? 'ASC' : 'DESC';
  }

  private static buildFieldWithAlias(field: unknown, alias: string = '') {
    return `${alias.trim() === '' ? '' : `${alias}.`}"${field}"`.trim();
  }

  private static validateOperandInLogicExp(
    type: 'left' | 'right',
    expression: grammar.Expression,
  ) {
    if (!this.validsExpInLogicExp.includes(expression.kind)) {
      throw new SyntaxError(
        `Invalid ${type} operand in LogicExpression: expected (${this.validsExpInLogicExp.join(', ')}), received: ${expression.kind}`,
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

  private static expressionToSql(
    expression: grammar.Expression,
    alias: string = '',
    valuesParams: unknown[],
  ): string {
    if (expression.kind === 'LiteralExpression') {
      valuesParams.push(expression.value);
      return `$${valuesParams.length}`;
    }

    if (expression.kind === 'FieldExpression') {
      return this.buildFieldWithAlias(expression.value, alias);
    }

    if (expression.kind === 'ComparisonExpression') {
      const leftExpression: string = this.expressionToSql(
        expression.left,
        alias,
        valuesParams,
      );

      const rightExpression: string = this.expressionToSql(
        expression.right,
        alias,
        valuesParams,
      );

      return `(${leftExpression} ${this.mapComparisonOperatorsToSql[expression.operator]} ${rightExpression})`;
    }

    if (expression.kind === 'LogicExpression') {
      this.validateOperandInLogicExp('left', expression.left);

      this.validateOperandInLogicExp('right', expression.right);

      const leftExpression: string = this.expressionToSql(
        expression.left,
        alias,
        valuesParams,
      );

      const rightExpression: string = this.expressionToSql(
        expression.right,
        alias,
        valuesParams,
      );

      return `(${leftExpression} ${this.mapLogicperatorsToSql[expression.operator]} ${rightExpression})`;
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
      const expr: string = this.expressionToSql(
        expression.expression,
        alias,
        valuesParams,
      );

      return `(NOT ${expr})`;
    }

    if (expression.kind === 'ArrayExpression') {
      const expr: string[] = [];
      for (const itemExpression of expression.items) {
        expr.push(this.expressionToSql(itemExpression, alias, valuesParams));
      }
      return ` (${expr.join(', ')})`;
    }

    if (expression.kind === 'InExpression') {
      const value = this.expressionToSql(expression.value, alias, valuesParams);
      const arrayExpression = this.expressionToSql(
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
}
