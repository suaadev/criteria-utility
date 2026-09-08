import { Expression } from "./expression";

export class NotExpression extends Expression {
  kind: string = "NotExpression" as const;

  constructor(readonly expression: Expression) {
    super();
  }

  static create(expression: Expression) {
    return new NotExpression(expression);
  }
}
