import { Criteria } from "./criteria";
import { ExpressionRaw } from "./filter/basic-grammar";
import { PostgresSqlGenerator } from "./generators/postgres-sql.generator";
import { Pagination } from "./pagination/pagination";

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
  and: [
    {
      or: [
        { equals: [1, 2] },
        { equals: ["$animal_type", "cat"] },
        //  { not: { in: ["$id", [1, 2, 3, 3]] } },
        { in: [3, [1, 2, 3, 3]] },
      ],
    },

    {
      not: {
        and: [{ equals: [2, 3] }, { equals: ["1", 5] }, { equals: [6, 6] }],
      },
    },
  ],
};

const exp3: ExpressionRaw = {
  and: [{ equals: ["$test", 2] }, true, true],
};

const exp4: ExpressionRaw = {
  and: [
    { equals: ["$username", "pepito"] },
    { equals: ["$email", "pepito"] },
    { in: [3, [3, 4, 5, 6, 6]] },
  ],
};

//console.dir(exp, { depth: null });

const criteria = Criteria.build(exp4, Pagination.byPage(1), {
  id: "ASC",
});

//criteria.limit = null;

console.log(criteria.filterExpression);
