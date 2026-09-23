import {
  ComparisonOperator,
  Expression,
  LogicalOperator,
} from "../filter/grammar";

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
    "&": "AND",
    "|": "OR",
    "||": "OR",
  };

  static generate(expression: Expression, alias: string = ""): string {
    if (expression.kind === "LiteralExpression") {
      if (typeof expression.value === "string") {
        return `'${expression.value}'`;
      }
      if (typeof expression.value === "boolean") {
        return `${expression.value}`.toUpperCase();
      }

      return `${expression.value}`;
    }

    if (expression.kind === "IdExpression") {
      const idEpxression = expression.value.slice(1).toUpperCase();
      return alias.trim() != "" ? `"${alias}".${idEpxression}` : idEpxression;
    }

    if (expression.kind === "ComparisonExpression") {
      const leftExpression: string = this.generate(expression.left, alias);
      const rightExpression: string = this.generate(expression.right, alias);
      return `(${leftExpression} ${this.mapComparisonOperatorsToSql[expression.operator]} ${rightExpression})`;
    }

    if (expression.kind === "LogicExpression") {
      if (
        expression.left.kind === "LiteralExpression" &&
        typeof expression.left.value != "boolean"
      ) {
        throw new SyntaxError(
          `Invalid left operand in LogicExpression: expected boolean, received ${typeof expression.left.value} (${expression.left.value})`
        );
      }

      if (
        expression.right.kind === "LiteralExpression" &&
        typeof expression.right.value != "boolean"
      ) {
        throw new SyntaxError(
          `Invalid right operand in LogicExpression: expected boolean, received ${typeof expression.right.value} (${expression.right.value})`
        );
      }

      const leftExpression: string = this.generate(expression.left, alias);

      const rightExpression: string = this.generate(expression.right, alias);

      return `(${leftExpression} ${this.mapLogicperatorsToSql[expression.operator]} ${rightExpression})`;
    }

    if (expression.kind === "NotExpression") {
      if (
        expression.expression.kind === "LiteralExpression" &&
        typeof expression.expression.value != "boolean"
      ) {
        throw new SyntaxError(
          `Invalid operand in NotExpression: expected boolean, received ${typeof expression.expression.value} (${expression.expression.value})`
        );
      }
      const expr: string = this.generate(expression.expression, alias);
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
            `Type mismatch in InExpression: elements must match value type (${typeof expression.value.value}), but received ${itemExpressionType} (${itemExpression.value})`
          );
        }

        const firstElementType = typeof expression.expression[0].value;
        if (itemExpressionType != firstElementType) {
          throw new SyntaxError(
            `Inconsistent types in InExpression: expected all elements to be ${firstElementType}, but found ${itemExpressionType} (${itemExpression.value})`
          );
        }

        expr.push(this.generate(itemExpression, alias));
      }
      const value = this.generate(expression.value, alias);

      return `(${value} IN (${expr.join(", ")}))`;
    }

    const unsupportedKind = (expression as { kind?: string }).kind ?? "unknown";
    throw new Error(
      `Unsupported expression kind for SQL generation: '${unsupportedKind}' (${JSON.stringify(expression)})`
    );
  }
}
