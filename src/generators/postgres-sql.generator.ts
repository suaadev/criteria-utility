import { Criteria } from "../criteria";
import {
  ComparisonOperator,
  Expression,
  LogicalOperator,
} from "../filter/grammar";
import { CursorSerializer } from "./cursor-serializer";

export class PostgresSqlGenerator {
  private static mapComparisonOperatorsToSql: Record<
    ComparisonOperator,
    string
  > = {
    "==": "=",
    "!=": "!=",
    "<=": "<=",
    ">=": ">=",
    "<": "<",
    ">": ">",
  };

  private static mapLogicperatorsToSql: Record<LogicalOperator, string> = {
    "&&": "AND",
    "||": "OR",
  };

  static fromCriteria(criteria: Criteria, alias: string = "") {
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

    let offsetStatement = "";

    let limitStatment = "";

    if (Number.isFinite(limit)) {
      if (pagination && typeof pagination.cursor === "string") {
        const { fields, sort } = CursorSerializer.decode(pagination.cursor);

        orderByFields = [];
        const valuesParamsPagination: string[] = [];
        const fieldsFormatted: string[] = [];

        for (const [field, value] of fields) {
          valuesParams.push(value);
          valuesParamsPagination.push(`$${valuesParams.length}`);
          fieldsFormatted.push(this.buildFieldWithAlias(field, alias));
          orderByFields.push(
            `${this.buildFieldWithAlias(field, alias)} ${sort}`,
          );
        }

        whereStatments.push(
          `(${fieldsFormatted.join(", ")}) ${sort === "DESC" ? "<" : ">"} (${valuesParamsPagination.join(", ")})`,
        );
      } else if (pagination && Number.isFinite(pagination.page)) {
        offsetStatement = `OFFSET ${(limit as number) * ((pagination.page as number) - 1)}`;
      }

      limitStatment = `LIMIT ${limit}`;
    }

    const outputSql: string = [
      whereStatments.join(" AND "),
      orderByFields.length > 0 ? `ORDER BY ${orderByFields.join(", ")}` : "",
      offsetStatement,
      limitStatment,
    ]
      .join(" ")
      .trim();

    return {
      sql: outputSql,
      values: valuesParams,
    };
  }

  private static buildFieldWithAlias(field: unknown, alias: string = "") {
    return `${alias.trim() === "" ? "" : `${alias}.`}"${field}"`.trim();
  }

  private static expressionToSql(
    expression: Expression,
    alias: string = "",
    valuesParams: unknown[],
  ): string {
    if (expression.kind === "LiteralExpression") {
      valuesParams.push(expression.value);
      return `$${valuesParams.length}`;
    }

    if (expression.kind === "IdExpression") {
      return this.buildFieldWithAlias(expression.value.slice(1), alias);
    }

    if (expression.kind === "ComparisonExpression") {
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

    if (expression.kind === "LogicExpression") {
      if (
        expression.left.kind === "LiteralExpression" &&
        typeof expression.left.value != "boolean"
      ) {
        throw new SyntaxError(
          `Invalid left operand in LogicExpression: expected boolean, received ${typeof expression.left.value} (${expression.left.value})`,
        );
      }

      if (
        expression.right.kind === "LiteralExpression" &&
        typeof expression.right.value != "boolean"
      ) {
        throw new SyntaxError(
          `Invalid right operand in LogicExpression: expected boolean, received ${typeof expression.right.value} (${expression.right.value})`,
        );
      }

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

    if (expression.kind === "NotExpression") {
      if (
        expression.expression.kind === "LiteralExpression" &&
        typeof expression.expression.value != "boolean"
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

    if (expression.kind === "InExpression") {
      const expr: string[] = [];

      for (const itemExpression of expression.expression) {
        const itemExpressionType = typeof itemExpression.value;
        if (
          expression.value.kind === "LiteralExpression" &&
          itemExpressionType != typeof expression.value.value
        ) {
          throw new SyntaxError(
            `Type mismatch in InExpression: elements must match value type (${typeof expression.value.value}), but received ${itemExpressionType} (${itemExpression.value})`,
          );
        }

        const firstElementType = typeof expression.expression[0].value;
        if (itemExpressionType != firstElementType) {
          throw new SyntaxError(
            `Inconsistent types in InExpression: expected all elements to be ${firstElementType}, but found ${itemExpressionType} (${itemExpression.value})`,
          );
        }

        expr.push(this.expressionToSql(itemExpression, alias, valuesParams));
      }
      const value = this.expressionToSql(expression.value, alias, valuesParams);

      return `(${value} IN (${expr.join(", ")}))`;
    }

    const unsupportedKind = (expression as { kind?: string }).kind ?? "unknown";

    throw new Error(
      `Unsupported expression kind for SQL generation: '${unsupportedKind}' (${JSON.stringify(expression)})`,
    );
  }
}
