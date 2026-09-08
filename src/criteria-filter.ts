import { ComparisonExpression } from "./types/comparision-expression";
import { Expression } from "./types/expression";
import { LiteralExpression } from "./types/literal-expression";
import { LogicExpression } from "./types/logic-expression";
import { NotExpression } from "./types/not-expression";

export class Filter {
  private constructor() {}

  static equals(...values: Expression[]) {
    return this.buildExpressions(
      values,
      (le, ce) => ComparisonExpression.create(le, "==", ce),
      "ComparisonExpression",
    );
  }

  static and(...values: Expression[]) {
    return this.buildExpressions(
      values,
      (le, ce) => LogicExpression.create(le, "&&", ce),
      "LogicExpression",
    );
  }

  static or(...values: Expression[]) {
    return this.buildExpressions(
      values,
      (le, ce) => LogicExpression.create(le, "||", ce),
      "LogicExpression",
    );
  }

  static not(value: Expression) {
    if (value instanceof NotExpression) return value;
    return NotExpression.create(value);
  }

  private static buildExpressions(
    valueExpressions: Expression[],
    build: (
      lastExpression: Expression,
      currentExpression: Expression,
    ) => Expression,
    kind: string,
  ) {
    if (valueExpressions.length <= 1)
      throw new Error(`${kind}: require 2 o more expressions.`);

    let lastExpression: Expression = valueExpressions[0];

    for (let i = 1; i < valueExpressions.length; i++) {
      const Filter = valueExpressions[i];
      if (lastExpression) {
        lastExpression = build(lastExpression, Filter);
      } else {
        lastExpression = Filter;
      }
    }
    return lastExpression;
  }

  static checkExpression(exp: Expression, acc = true): boolean {
    if (!acc) return acc;

    if (!(exp instanceof Expression)) return false;

    if (
      exp instanceof LiteralExpression &&
      !["number", "string", "boolean"].includes(typeof exp.value)
    ) {
      return false;
    }

    if (exp instanceof ComparisonExpression) {
      if (!exp.left || !exp.right) return false;
      return (
        this.checkExpression(exp.left, true && acc) &&
        this.checkExpression(exp.right, true && acc)
      );
    }

    if (exp instanceof LogicExpression) {
      if (
        exp.left.kind === "LiteralExpression" ||
        exp.right.kind === "LiteralExpression"
      )
        return false;
      return (
        this.checkExpression(exp.left, true && acc) &&
        this.checkExpression(exp.right, true && acc)
      );
    }

    return acc;
  }
}
