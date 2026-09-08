import { Expression } from "./expression";
type LogicalOperator = "&&" | "&" | "||" | "|";

export class LogicExpression extends Expression {
  kind: string = "LogicExpression" as const;

  constructor(
    readonly left: Expression,
    readonly operator: LogicalOperator,
    public right: Expression,
  ) {
    super();
  }

  static create(
    left: Expression,
    operator: LogicalOperator,
    right: Expression,
  ) {
    return new LogicExpression(left, operator, right);
  }
}
