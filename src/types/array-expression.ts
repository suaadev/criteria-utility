import { Expression } from "./expression";

export class ArrayExpression extends Expression {
  constructor(readonly elements: Expression[]) {
    super("ArrayExpression");
  }

  static create(elements: Expression[]) {
    return new ArrayExpression(elements);
  }
}
