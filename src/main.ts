import { ExpressionRaw } from "./filter/basic-grammar";
import { FilterParser } from "./filter/filter-parser";
import { PostgresSqlGenerator } from "./generators/postgres-sql.generator";

const exp1: ExpressionRaw = {
  and: [
    {
      not: {
        and: [
          {
            gt: [1, 2],
          },
          {
            gt: [1, 2],
          },
        ],
      },
    },
    false,
    {
      or: [true, { and: [{ gt: [1, 2] }, { gt: [1, 2] }] }],
    },
    {
      not: {
        not: {
          not: {
            or: [
              { and: [{ equals: [1, 2] }, { equals: [1, 2] }] },
              true,
              false,
            ],
          },
        },
      },
    },
  ],
};

const exp2: ExpressionRaw = {
  equals: [
    {
      or: [
        { equals: [1, 2] },
        { equals: ["$cie11_title", "cat"] },
        { not: { in: ["$id", [1, 2, 3, 3]] } },
      ],
    },
    {
      not: {
        and: [{ equals: [2, 3] }, { equals: ["1", 5] }, { equals: [6, 7] }],
      },
    },
  ],
};

const exp = FilterParser.parse(exp2);

console.dir(exp, { depth: null });

const sqlSyntax = PostgresSqlGenerator.generate(exp, "dcm");

console.log(sqlSyntax);
