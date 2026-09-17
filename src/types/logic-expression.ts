import { Expression } from "./expression";
export type LogicalOperator = "&&" | "&" | "||" | "|";

export class LogicExpression extends Expression {
  constructor(
    readonly left: Expression,
    readonly operator: LogicalOperator,
    public right: Expression,
  ) {
    super("LogicExpression");
  }

  static create(
    left: Expression,
    operator: LogicalOperator,
    right: Expression,
  ) {
    return new LogicExpression(left, operator, right);
  }
}
