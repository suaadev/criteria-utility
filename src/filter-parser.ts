import {
  ComparasionOperator,
  ComparisonExpression,
} from "./types/comparision-expression";
import { Expression } from "./types/expression";
import { LiteralExpression } from "./types/literal-expression";
import { LogicalOperator, LogicExpression } from "./types/logic-expression";
import { NotExpression } from "./types/not-expression";

export type LogicOperatorRaw = "and" | "or";
export type ComparisonOperatorsRaw = "equals" | "diff" | "gt" | "lt";
export type LiteralExpressionRaw = number | string | boolean;
export type ComparisionRaw = Partial<{
  [key in ComparisonOperatorsRaw]: (ExpressionRaw | LiteralExpressionRaw)[];
}>;
export type ConditionalRaw = Partial<{
  [Key in LogicOperatorRaw]: (LiteralExpressionRaw | ExpressionRaw)[];
}>;
export type NotExpressionRaw = {
  not:
    | ConditionalRaw
    | ComparisionRaw
    | LiteralExpressionRaw
    | NotExpressionRaw;
};
export type ExpressionRaw = NotExpressionRaw | ConditionalRaw | ComparisionRaw;

export type InputParser =
  | Partial<ConditionalRaw & ComparisionRaw & NotExpressionRaw>
  | LiteralExpressionRaw;

const mapRawComparisoOperator: Record<
  ComparisonOperatorsRaw,
  ComparasionOperator
> = {
  equals: "==",
  diff: "!=",
  gt: ">",
  lt: "<",
};

const mapLogicOperator: Record<LogicOperatorRaw, LogicalOperator> = {
  and: "&&",
  or: "||",
};

export class FilterParser {
  private constructor() {}

  static parser(input: InputParser): Expression {
    //Literal expressions

    if (["string", "number", "boolean"].includes(typeof input))
      return LiteralExpression.create(input as LiteralExpressionRaw);

    if (typeof input != "object") {
      throw new SyntaxError("Invalid input");
    }

    const keys = Object.keys(input);

    if (keys.length != 1) {
      throw new SyntaxError(
        "Input object is not valid, only must contain one key",
      );
    }

    const key = keys[0];

    // Comparison operators
    if (key === "equals" || key === "diff" || key === "gt" || key === "lt") {
      const expressionsRaw =
        input["equals"] || input["diff"] || input["gt"] || input["lt"];

      if (!Array.isArray(expressionsRaw))
        throw new SyntaxError(
          "The Comparison expression must be a array with expressions.",
        );

      if (expressionsRaw.length <= 1) {
        throw new SyntaxError(
          "The Comparison expression must contain at least two arguments.",
        );
      }

      const expressions: Expression[] = expressionsRaw.map((e) =>
        this.parser(e),
      );

      return this.buildExpressions(expressions, (le, re) =>
        ComparisonExpression.create(le, mapRawComparisoOperator[key], re),
      );
    }

    // Logic operators

    if (key === "and" || key === "or") {
      const expressionsRaw = input["and"] || input["or"];

      if (!Array.isArray(expressionsRaw))
        throw new SyntaxError(
          `The Logic expression must be a array with expressions.`,
        );

      if (expressionsRaw.length <= 1) {
        throw new SyntaxError(
          "The Logic expression must be contain at least two arguments.",
        );
      }

      const expressions: Expression[] = expressionsRaw.map((e) =>
        this.parser(e),
      );

      return this.buildExpressions(expressions, (le, re) =>
        LogicExpression.create(le, mapLogicOperator[key], re),
      );
    }

    // Not expression

    if (key === "not") {
      const expressionsRaw = input["not"];

      if (!expressionsRaw) {
        throw new SyntaxError("The NOT expressions is invalid");
      }

      const expression: Expression = this.parser(expressionsRaw);

      if (expression instanceof NotExpression) {
        return expression.expression;
      }

      return NotExpression.create(expression);
    }

    throw new SyntaxError("The input expression is invalid");
  }

  private static buildExpressions(
    expressionsToAppend: Expression[],
    builder: (
      lastExpression: Expression,
      currentExpression: Expression,
    ) => Expression,
  ) {
    let lastExpression: Expression = expressionsToAppend[0];

    for (let i = 1; i < expressionsToAppend.length; i++) {
      const expressionToAppend = expressionsToAppend[i];

      lastExpression = builder(lastExpression, expressionToAppend);
    }
    return lastExpression;
  }
}
