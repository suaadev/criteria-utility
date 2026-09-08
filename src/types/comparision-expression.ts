import { Expression } from "./expression";

export type ComparasionOperator = "==" | "!=" | ">" | "<" | ">=" | "<=" | "in";

export class ComparisonExpression extends Expression {
  kind: string = "ComparisonExpression" as const;

  constructor(
    readonly left: Expression,
    readonly operator: ComparasionOperator,
    readonly right: Expression,
  ) {
    super();
  }

  static create(
    left: Expression,
    operator: ComparasionOperator,
    right: Expression,
  ) {
    return new ComparisonExpression(left, operator, right);
  }
}
