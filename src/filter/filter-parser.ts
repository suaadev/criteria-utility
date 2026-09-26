import {
  ComparisonExpressionRightRaw,
  ComparisonOperatorsRaw,
  ConditionalRaw,
  ExpressionRaw,
  InExpressionRightRaw,
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
  FieldExpression,
  InExpression,
} from "./grammar";

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

  private static readonly idExpressionRegex: RegExp =
    /^\$[a-zA-Z_][a-zA-Z0-9_]*$/;

  private constructor() {}

  static parse<T>(input: ExpressionRaw<T> = null): Expression {
    // Field expressions
    if (typeof input === "string" && input.charAt(0) === "$") {
      if (!this.idExpressionRegex.test(input)) {
        throw new SyntaxError(
          `The field or id expression provide is invalid: ${input}`,
        );
      }
      return this.buildFieldExpression(input.slice(1));
    }

    // Literal expressions
    if (
      input === null ||
      ["string", "number", "boolean"].includes(typeof input)
    ) {
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

    // Logic operators

    if (key === "and" || key === "or") {
      const expressionsRaw = (input as ConditionalRaw<T>)[key];

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
      const expressionsRaw = (input as NotExpressionRaw<T>)["not"];

      if (!expressionsRaw) {
        throw new SyntaxError("The NOT expressions is invalid");
      }

      const expression: Expression = this.parse(expressionsRaw);

      return this.buildNotExpression(expression);
    }

    const field = key as keyof T;

    const operation = (
      input as Record<
        keyof T,
        Partial<InExpressionRightRaw & ComparisonExpressionRightRaw<T>>
      >
    )[field];

    const keysOperation = Object.keys(operation);

    if (keysOperation.length !== 1) {
      throw new SyntaxError("The field require a operand");
    }

    const operator: string = keysOperation[0];

    // Comparison operators
    if (
      operator === "equals" ||
      operator === "diff" ||
      operator === "gt" ||
      operator === "lt" ||
      operator === "gte" ||
      operator === "lte"
    ) {
      const expressionsRaw = operation[operator];

      return this.buildComparisonExpression(
        this.buildFieldExpression(key),
        this.mapRawComparisonOperator[operator],
        this.parse(expressionsRaw ?? null),
      );
    }

    // In expression
    if (operator === "in") {
      const expressionsRaw = operation[operator];

      if (!Array.isArray(expressionsRaw) || expressionsRaw.length < 1) {
        throw new SyntaxError(
          "The IN expression must contain an expression and an array of literals.",
        );
      }

      const items: LiteralExpression[] = [];

      for (const element of expressionsRaw) {
        const expression = this.parse(element);
        if (expression.kind != "LiteralExpression") {
          throw new SyntaxError(
            "The IN expressions require a literalExpression or IdExpression with value",
          );
        }
        items.push(expression);
      }

      return this.buildInExpression(this.buildFieldExpression(key), items);
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
    value: LiteralExpression | FieldExpression,
    expression: LiteralExpression[],
  ): InExpression {
    return { kind: "InExpression", expression, value };
  }

  private static buildFieldExpression(value: string): FieldExpression {
    return { kind: "FieldExpression", value };
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
