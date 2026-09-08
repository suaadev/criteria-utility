import { Filter } from "./criteria-filter";
import { toObjectPlainParser } from "./helpers/to-object-plain.parser.";
import { LiteralExpression } from "./types/literal-expression";

const exp1 = Filter.equals(
  LiteralExpression.create(2),
  Filter.and(
    Filter.equals(LiteralExpression.create(2), LiteralExpression.create(2)),
    LiteralExpression.create(2),
    Filter.not(
      Filter.equals(LiteralExpression.create(2), LiteralExpression.create(2)),
    ),
    Filter.not(LiteralExpression.create(7)),
    Filter.or(LiteralExpression.create(7), LiteralExpression.create(7)),
  ),
);

const objectPlain = toObjectPlainParser(exp1);

console.dir(exp1, { depth: null });
console.dir(Filter.checkExpression(exp1), { depth: null });
