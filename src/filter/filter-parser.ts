import {
  ComparisonOperatorsRaw,
  ComparisonRaw,
  ConditionalRaw,
  InExpressionRaw,
  LiteralExpressionRaw,
  LogicOperatorRaw,
  NotExpressionRaw,
} from "./basic-grammar";
import {
  LiteralExpression,
  LiteralExpressionValids,
  Expression,
  ComparisonOperator,
  ComparisonExpression,
  LogicalOperator,
  LogicExpression,
  NotExpression,
  IdExpression,
  InExpression,
} from "./grammar";

export type InputParser =
  | Partial<ConditionalRaw & ComparisonRaw & NotExpressionRaw & InExpressionRaw>
  | LiteralExpressionRaw;

export class FilterParser {
  private static readonly mapRawComparisonOperator: Record<
    ComparisonOperatorsRaw,
    ComparisonOperator
  > = {
    equals: "==",
    diff: "!=",
    gt: ">",
    lt: "<",
    gte: ">=",
    lte: "<=",
  };

  private static readonly mapLogicOperator: Record<
    LogicOperatorRaw,
    LogicalOperator
  > = {
    and: "&&",
    or: "||",
  };

  private constructor() {}

  static parse(input: InputParser): Expression {
    //Literal expressions

    if (["string", "number", "boolean"].includes(typeof input)) {
      if (typeof input === "string" && input.charAt(0) === "$") {
        return this.buildIdExpression(input);
      }
      return this.buildLiteralExpression(input as LiteralExpressionRaw);
    }

    if (!input || typeof input != "object") {
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
    if (
      key === "equals" ||
      key === "diff" ||
      key === "gt" ||
      key === "lt" ||
      key === "gte" ||
      key === "lte"
    ) {
      const expressionsRaw =
        input["equals"] ||
        input["diff"] ||
        input["gt"] ||
        input["lt"] ||
        input["gte"] ||
        input["lte"];

      if (!Array.isArray(expressionsRaw))
        throw new SyntaxError(
          "The Comparison expression must be a array with expressions.",
        );

      if (expressionsRaw.length != 2) {
        throw new SyntaxError(
          "The Comparison expression must contain two arguments.",
        );
      }

      return this.buildComparisonExpression(
        this.parse(expressionsRaw[0]),
        this.mapRawComparisonOperator[key],
        this.parse(expressionsRaw[1]),
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
        this.parse(e),
      );

      return this.appendExpressions(expressions, (le, re) =>
        this.buildLogicExpression(le, this.mapLogicOperator[key], re),
      );
    }

    // Not expression

    if (key === "not") {
      const expressionsRaw = input["not"];

      if (!expressionsRaw) {
        throw new SyntaxError("The NOT expressions is invalid");
      }

      const expression: Expression = this.parse(expressionsRaw);

      return this.buildNotExpression(expression);
    }

    // In expression
    if (key === "in") {
      const expressionsRaw = input["in"];

      if (
        !Array.isArray(expressionsRaw) ||
        expressionsRaw.length !== 2 ||
        !Array.isArray(expressionsRaw[1])
      ) {
        throw new SyntaxError(
          "The IN expression must contain an expression and an array of literals.",
        );
      }

      const expression1: Expression = this.parse(expressionsRaw[0]);

      if (
        expression1.kind != "IdExpression" &&
        expression1.kind != "LiteralExpression"
      ) {
        throw new SyntaxError(
          "The IN expressions require a literalExpression or IdExpression with value",
        );
      }

      const expression2: LiteralExpression[] = [];

      for (const element of expressionsRaw[1]) {
        const expression = this.parse(element);
        if (expression.kind != "LiteralExpression") {
          throw new SyntaxError(
            "The IN expressions require a literalExpression or IdExpression with value",
          );
        }
        expression2.push(expression);
      }

      return this.buildInExpression(expression1, expression2);
    }

    throw new SyntaxError("The input expression is invalid");
  }
  private static buildLiteralExpression(
    value: LiteralExpressionValids,
  ): LiteralExpression {
    return { kind: "LiteralExpression", value };
  }

  private static buildComparisonExpression(
    left: Expression,
    operator: ComparisonOperator,
    right: Expression,
  ): ComparisonExpression {
    return { kind: "ComparisonExpression", left, operator, right };
  }

  private static buildLogicExpression(
    left: Expression,
    operator: LogicalOperator,
    right: Expression,
  ): LogicExpression {
    return { kind: "LogicExpression", left, operator, right };
  }

  private static buildNotExpression(expression: Expression): NotExpression {
    return { kind: "NotExpression", expression };
  }

  private static buildInExpression(
    value: LiteralExpression | IdExpression,
    expression: LiteralExpression[],
  ): InExpression {
    return { kind: "InExpression", expression, value };
  }

  private static buildIdExpression(value: string): IdExpression {
    return { kind: "IdExpression", value };
  }

  private static appendExpressions(
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
