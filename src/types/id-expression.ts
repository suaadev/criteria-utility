import { Expression } from "./expression";

export class IdExpression extends Expression {
  constructor(readonly id: string) {
    super("IdExpression");
  }

  static create(id: string) {
    return new IdExpression(id);
  }
}
