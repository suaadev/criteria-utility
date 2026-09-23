import {
  ComparisonOperator,
  Expression,
  LiteralExpressionValids,
  LogicalOperator,
} from "./grammar";

type OperationCallback<L, R, T> = (left: L, right: R) => T;

export class FilterOptimizer {
  private static readonly logicMapOperations: Record<
    LogicalOperator,
    OperationCallback<boolean, boolean, boolean>
  > = {
    "&&": (left: boolean, right: boolean) => left && right,
    "||": (left: boolean, right: boolean) => left || right,
  };

  private static readonly comparisonMapOperations: Record<
    ComparisonOperator,
    OperationCallback<LiteralExpressionValids, LiteralExpressionValids, boolean>
  > = {
    "==": (left: LiteralExpressionValids, right: LiteralExpressionValids) =>
      left === right,
    "!=": (left: LiteralExpressionValids, right: LiteralExpressionValids) =>
      left !== right,
    "<": (left: LiteralExpressionValids, right: LiteralExpressionValids) =>
      left < right,
    ">": (left: LiteralExpressionValids, right: LiteralExpressionValids) =>
      left > right,
    "<=": (left: LiteralExpressionValids, right: LiteralExpressionValids) =>
      left <= right,
    ">=": (left: LiteralExpressionValids, right: LiteralExpressionValids) =>
      left >= right,
  };

  static optimize(expression: Expression): Expression {
    if (expression.kind === "ComparisonExpression") {
      expression.left = this.optimize(expression.left);
      expression.right = this.optimize(expression.right);

      if (
        expression.left.kind === "LiteralExpression" &&
        expression.right.kind === "LiteralExpression"
      ) {
        const result: boolean = this.comparisonMapOperations[
          expression.operator
        ](expression.left.value, expression.right.value);

        expression = {
          kind: "LiteralExpression",
          value: result,
        };
      }

      return expression;
    }

    if (expression.kind === "LogicExpression") {
      expression.left = this.optimize(expression.left);
      expression.right = this.optimize(expression.right);

      if (
        expression.left.kind === "LiteralExpression" &&
        expression.right.kind === "LiteralExpression" &&
        typeof expression.left.value === "boolean" &&
        typeof expression.right.value === "boolean"
      ) {
        const result: boolean = this.logicMapOperations[expression.operator](
          expression.left.value,
          expression.right.value,
        );
        expression = {
          kind: "LiteralExpression",
          value: result,
        };
      } else if (
        expression.left.kind === "LiteralExpression" &&
        typeof expression.left.value === "boolean"
      ) {
        if (expression.operator === "||") {
          expression = expression.left.value
            ? { kind: "LiteralExpression", value: true }
            : expression.right;
        } else if (expression.operator === "&&") {
          expression = expression.left.value
            ? expression.right
            : {
                kind: "LiteralExpression",
                value: false,
              };
        }
      } else if (
        expression.right.kind === "LiteralExpression" &&
        typeof expression.right.value === "boolean"
      ) {
        if (expression.operator === "||") {
          expression = expression.right.value
            ? { kind: "LiteralExpression", value: true }
            : expression.left;
        } else if (expression.operator === "&&") {
          expression = expression.right.value
            ? expression.left
            : {
                kind: "LiteralExpression",
                value: false,
              };
        }
      }

      return expression;
    }

    if (expression.kind === "NotExpression") {
      expression.expression = this.optimize(expression.expression);

      if (expression.expression.kind === "NotExpression") {
        expression = expression.expression.expression;
      } else if (
        expression.expression.kind === "LiteralExpression" &&
        typeof expression.expression.value === "boolean"
      ) {
        expression = {
          kind: "LiteralExpression",
          value: !expression.expression.value,
        };
      }
      return expression;
    }

    if (
      expression.kind === "InExpression" &&
      expression.value.kind === "LiteralExpression"
    ) {
      const valueToFind = expression.value.value;
      const result: boolean = expression.expression.some(
        (e) => e.value === valueToFind,
      );
      expression = {
        kind: "LiteralExpression",
        value: result,
      };
    }

    return expression;
  }
}
