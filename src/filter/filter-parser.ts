import * as basicGrammar from "./basic-grammar.js";
import * as grammar from "./grammar.js";

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
          `The field or id expression provided is invalid: ${input}`,
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

    // Array Expression
    if (Array.isArray(input)) {
      const items: (
        | grammar.LiteralExpression
        | grammar.FieldExpression
        | grammar.ArrayExpression
      )[] = [];

      for (const item of input) {
        const expression = this.parse(item);
        if (
          expression.kind !== "LiteralExpression" &&
          expression.kind !== "FieldExpression" &&
          expression.kind !== "ArrayExpression"
        ) {
          throw new SyntaxError(
            "The Array expression requires a LiteralExpression, ArrayExpression, or FieldExpression",
          );
        }
        items.push(expression);
      }
      return this.buildArrayExpression(items);
    }

    if (!input || typeof input != "object") {
      throw new SyntaxError("Invalid input");
    }

    const keys = Object.keys(input);

    if (keys.length != 1) {
      throw new SyntaxError(
        "Input object is not valid; it must contain only one key",
      );
    }

    const key = keys[0];

    // Logic operators

    if (key === "and" || key === "or") {
      const expressionsRaw = (input as basicGrammar.ConditionalRaw<T>)[key];

      if (!Array.isArray(expressionsRaw))
        throw new SyntaxError(
          `The Logic expression must be an array of expressions.`,
        );

      if (expressionsRaw.length <= 1) {
        throw new SyntaxError(
          "The Logic expression must contain at least two arguments.",
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
        throw new SyntaxError("The NOT expression is invalid");
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
      throw new SyntaxError("The field requires an operand");
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
      const arrayRaw = operation[operator];

      if (!Array.isArray(arrayRaw) || arrayRaw.length === 0) {
        throw new SyntaxError(
          "The Array expression in IN expression must contain at least one item",
        );
      }

      const arrayExpression = this.parse(arrayRaw);

      if (arrayExpression.kind !== "ArrayExpression") {
        throw new SyntaxError(
          "The IN expression must contain an array of literal or field expressions.",
        );
      }

      return this.buildInExpression(
        this.buildFieldExpression(key),
        arrayExpression,
      );
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

  private static buildArrayExpression(
    items: (
      | grammar.LiteralExpression
      | grammar.FieldExpression
      | grammar.ArrayExpression
    )[],
  ): grammar.ArrayExpression {
    return {
      kind: "ArrayExpression",
      items,
    };
  }

  private static buildInExpression(
    value: grammar.LiteralExpression | grammar.FieldExpression,
    arrayExpression: grammar.ArrayExpression,
  ): grammar.InExpression {
    return { kind: "InExpression", arrayExpression, value };
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
