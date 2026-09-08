import { Expression } from "./expression";

export type LiteralExpressionValids = number | string | boolean;

export class LiteralExpression extends Expression {
  kind: string = "LiteralExpression" as const;

  constructor(readonly value: LiteralExpressionValids) {
    super();
  }

  static create(value: LiteralExpressionValids) {
    return new LiteralExpression(value);
  }
}
