import { ExpressionRaw } from "./basic-grammar";
import { FilterParser } from "./filter-parser";

const exp1: ExpressionRaw = {
  and: [
    {
      not: {
        and: [
          {
            gt: [1, 2],
          },
        ],
      },
    },
    2,
    {
      or: [1, 2, { and: [{ gt: [1, 2] }] }],
    },
    {
      not: {
        not: {
          not: { or: [{ and: [{ equals: [1, 2] }] }, 1, true] },
        },
      },
    },
  ],
};

const exp2: ExpressionRaw = {
  equals: [
    { or: ["$dog", 2, { in: [1, [1, 2, 3, 4]] }] },
    {
      not: {
        and: [{ equals: [2, 3] }, { equals: [4, 5] }, { equals: [6, 7] }],
      },
    },
  ],
};

const exp = FilterParser.parse(exp2);

console.dir(exp, { depth: null });
