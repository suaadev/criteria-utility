import { ExpressionRaw, FilterParser } from "./filter-parser";

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
    { or: [1, 2] },
    { not: { not: { not: { not: true } } } },
    {
      not: {
        and: [{ equals: [2, 3] }, { equals: [4, 5] }, { equals: [6, 7] }],
      },
    },
  ],
};

const exp = FilterParser.parser(exp2);

console.dir(exp, { depth: null });
