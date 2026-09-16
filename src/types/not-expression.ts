import { Expression } from "./expression";

export class NotExpression extends Expression {
  constructor(readonly expression: Expression) {
    super("NotExpression");
  }

  static create(expression: Expression) {
    return new NotExpression(expression);
  }
}
