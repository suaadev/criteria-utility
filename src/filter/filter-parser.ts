import * as basicGrammar from "./basic-grammar";
import * as grammar from "./grammar";

export class FilterParser {
  private static readonly mapRawComparisonOperator: Record<
    basicGrammar.ComparisonOperatorsRaw,
    grammar.ComparisonOperator
  > = {
    equals: "==",
    diff: "!=",
    gt: ">",
    lt: "<",
    gte: ">=",
    lte: "<=",
  };

  private static readonly mapLogicOperator: Record<
    basicGrammar.LogicOperatorRaw,
    grammar.LogicalOperator
  > = {
    and: "&&",
    or: "||",
  };

  private static readonly idExpressionRegex: RegExp =
    /^\$[a-zA-Z_][a-zA-Z0-9_]*$/;

  private constructor() {}

  static parse<T>(
    input: basicGrammar.ExpressionRaw<T> = null,
  ): grammar.Expression {
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
      return this.buildLiteralExpression(
        input as basicGrammar.LiteralExpressionRaw,
      );
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
      const expressionsRaw = (input as basicGrammar.ConditionalRaw<T>)[key];

      if (!Array.isArray(expressionsRaw))
        throw new SyntaxError(
          `The Logic expression must be a array with expressions.`,
        );

      if (expressionsRaw.length <= 1) {
        throw new SyntaxError(
          "The Logic expression must be contain at least two arguments.",
        );
      }

      const expressions: grammar.Expression[] = expressionsRaw.map((e) =>
        this.parse(e),
      );

      return this.appendExpressions(expressions, (le, re) =>
        this.buildLogicExpression(le, this.mapLogicOperator[key], re),
      );
    }

    // Not expression

    if (key === "not") {
      const expressionsRaw = (input as basicGrammar.NotExpressionRaw<T>)["not"];

      if (!expressionsRaw) {
        throw new SyntaxError("The NOT expressions is invalid");
      }

      const expression: grammar.Expression = this.parse(expressionsRaw);

      return this.buildNotExpression(expression);
    }

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

      const items: grammar.LiteralExpression[] = [];

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
    value: grammar.LiteralExpressionValids,
  ): grammar.LiteralExpression {
    return { kind: "LiteralExpression", value };
  }

  private static buildComparisonExpression(
    left: grammar.Expression,
    operator: grammar.ComparisonOperator,
    right: grammar.Expression,
  ): grammar.ComparisonExpression {
    return { kind: "ComparisonExpression", left, operator, right };
  }

  private static buildLogicExpression(
    left: grammar.Expression,
    operator: grammar.LogicalOperator,
    right: grammar.Expression,
  ): grammar.LogicExpression {
    return { kind: "LogicExpression", left, operator, right };
  }

  private static buildNotExpression(
    expression: grammar.Expression,
  ): grammar.NotExpression {
    return { kind: "NotExpression", expression };
  }

  private static buildInExpression(
    value: grammar.LiteralExpression | grammar.FieldExpression,
    expression: grammar.LiteralExpression[],
  ): grammar.InExpression {
    return { kind: "InExpression", expression, value };
  }

  private static buildFieldExpression(value: string): grammar.FieldExpression {
    return { kind: "FieldExpression", value };
  }

  private static appendExpressions(
    expressionsToAppend: grammar.Expression[],
    builder: (
      lastExpression: grammar.Expression,
      currentExpression: grammar.Expression,
    ) => grammar.Expression,
  ) {
    let lastExpression: grammar.Expression = expressionsToAppend[0];

    for (let i = 1; i < expressionsToAppend.length; i++) {
      const expressionToAppend = expressionsToAppend[i];

      lastExpression = builder(lastExpression, expressionToAppend);
    }
    return lastExpression;
  }
}
