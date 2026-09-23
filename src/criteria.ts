import { ExpressionRaw } from "./filter/basic-grammar";
import { FilterOptimizer } from "./filter/filter-optimizer";
import { FilterParser } from "./filter/filter-parser";
import { Expression } from "./filter/grammar";
import { Pagination } from "./pagination/pagination";

export type Sort = "ASC" | "DESC";

export type OrderBy = Record<string, Sort>;

export class Criteria {
  static DEFAULT_LIMIT: number = 15;

  private constructor(
    readonly filterExpression: Expression,
    public pagination: Pagination | null,
    public orderBy: OrderBy | null,
    private limit_: number | null,
  ) {
    this.validateLimit(this.limit ?? Criteria.DEFAULT_LIMIT);
  }

  static build(
    filterExpression: ExpressionRaw,
    pagination?: Pagination | null,
    orderBy?: OrderBy | null,
    limit: number | null = Criteria.DEFAULT_LIMIT,
  ) {
    const expressionParsed = FilterOptimizer.optimize(
      FilterParser.parse(filterExpression),
    );

    return new Criteria(
      expressionParsed,
      pagination ?? null,
      orderBy ?? null,
      limit,
    );
  }

  private validateLimit(limit: number) {
    if (!Number.isFinite(limit) || limit < 1) {
      throw new Error("Limit must be a finite integer greater or equal to 1");
    }
  }

  set limit(limit: number | null) {
    this.validateLimit(limit ?? Criteria.DEFAULT_LIMIT);
    this.limit_ = limit;
  }

  get limit() {
    return this.limit_;
  }

  toObjectPlain() {
    return {
      filterExpression: this.filterExpression,
      pagination: this.pagination?.toObjectPlain() ?? null,
      orderBy: this.orderBy,
      limit: this.limit,
    };
  }
}
