import { Criteria } from "./criteria";
import { ExpressionRaw } from "./filter/basic-grammar";
import { FilterParser } from "./filter/filter-parser";
import { CursorSerializer } from "./generators/cursor-serializer";
import { PostgresSqlGenerator } from "./generators/postgres-sql.generator";
import { Pagination } from "./pagination/pagination";

type User = {
  username: string;
  email: string;
  password: string;
  age: number;
  createdAt: string;
};

// The cursor is something like this, the cursor is builder in infrastructure layers like repositories implementations

const cursor: string = CursorSerializer.encode(
  {
    id: 10,
    name: "ddavivss",
    createdAt: "2026-09-24 11:56:26.472 -0500",
  },
  ["createdAt", "id"],
  "ASC",
);

const criteria = Criteria.build<User>(
  {
    and: [
      { not: { age: { in: [1, 2, 3, 3, 4] } } },
      {
        and: [{ username: { diff: null } }, { username: { equals: "jazzz" } }],
      },
    ],
  },
  Pagination.byCursor(cursor),
  [
    ["id", "ASC"],
    ["name", "DESC"],
  ],
  15,
);

const sql = PostgresSqlGenerator.fromCriteria(criteria, "us");

console.log(sql);
