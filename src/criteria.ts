import { ExpressionRaw } from './filter/basic-grammar.js';
import * as FilterParser from './filter/filter-parser.js';
import { Expression } from './filter/grammar.js';
import Pagination from './pagination.js';

export type Sort = 'ASC' | 'DESC';

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
    filterExpression?: ExpressionRaw<T> | Record<string, unknown> | null,
    pagination?: Pagination | null,
    orderBy?: ([keyof T, Sort] | [string, Sort])[] | null,
    limit?: number | null,
  ) {
    const expressionParsed = filterExpression
      ? FilterParser.parse(filterExpression)
      : null;

    const orderBy_ = new Map<string, Sort>(
      (orderBy ?? []).map((m) => [String(m[0]), m[1]]),
    );

    return new Criteria(
      expressionParsed,
      pagination ?? null,
      orderBy_,
      limit ?? null,
    );
  }

  private validateLimit(limit: number) {
    if (!Number.isFinite(limit) || limit < 1) {
      throw new Error(
        'Limit must be a finite integer greater than or equal to 1',
      );
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
