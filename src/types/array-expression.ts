import { Expression } from "./expression";

export class ArrayExpression extends Expression {
  kind: string = "ArrayExpression" as const;

  constructor(readonly elements: Expression[]) {
    super();
  }

  static create(elements: Expression[]) {
    return new ArrayExpression(elements);
  }
}
