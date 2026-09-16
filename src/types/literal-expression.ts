import { Expression } from "./expression";

export type LiteralExpressionValids = number | string | boolean;

export class LiteralExpression extends Expression {
  constructor(readonly value: LiteralExpressionValids) {
    super("LiteralExpression");
  }

  static create(value: LiteralExpressionValids) {
    return new LiteralExpression(value);
  }
}
