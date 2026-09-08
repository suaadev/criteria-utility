import { Expression } from "./expression";

export class IdExpression extends Expression {
  kind: string = "IdExpression" as const;

  constructor(readonly id: string) {
    super();
  }

  static create(id: string) {
    return new IdExpression(id);
  }
}
