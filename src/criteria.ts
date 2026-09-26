import { ExpressionRaw } from "./filter/basic-grammar";
import { FilterParser } from "./filter/filter-parser";
import { Expression } from "./filter/grammar";
import { Pagination } from "./pagination/pagination";

export type Sort = "ASC" | "DESC";

export type OrderBy = Map<string, Sort>;

export class Criteria {
  private constructor(
    readonly filterExpression: Expression | null,
    public pagination: Pagination | null,
    public orderBy: OrderBy,
    private limit_: number | null,
  ) {
    this.validateLimit(this.limit ?? 1);
  }

  static build<T>(
    filterExpression?: ExpressionRaw<T> | null,
    pagination?: Pagination | null,
    orderBy?: [string, Sort][] | null,
    limit?: number | null,
  ) {
    const expressionParsed = filterExpression
      ? FilterParser.parse(filterExpression)
      : null;

    return new Criteria(
      expressionParsed,
      pagination ?? null,
      new Map(orderBy ?? []),
      limit ?? null,
    );
  }

  private validateLimit(limit: number) {
    if (!Number.isFinite(limit) || limit < 1) {
      throw new Error("Limit must be a finite integer greater or equal to 1");
    }
  }

  set limit(limit: number | null) {
    this.validateLimit(limit ?? 1);
    this.limit_ = limit;
  }

  get limit() {
    return this.limit_;
  }

  toObjectPlain() {
    return {
      filterExpression: this.filterExpression,
      pagination: this.pagination?.toObjectPlain() ?? null,
      orderBy: Array.from(this.orderBy.entries()),
      limit: this.limit,
    };
  }
}
