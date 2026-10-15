import { ExpressionRaw } from './filter/basic-grammar.js';
import * as FilterParser from './filter/filter-parser.js';
import { Expression } from './filter/grammar.js';
import Pagination from './pagination.js';

export type Sort = 'ASC' | 'DESC';

export type OrderBy = Map<string, Sort>;

export class Criteria {
  private orderBy_: OrderBy;

  private constructor(
    readonly filterExpression: Expression | null,
    public pagination: Pagination | null,
    orderBy: [unknown, Sort][],
    private limit_: number | null,
  ) {
    this.validateLimit(limit_);
    this.validatePaginationIntegrity(pagination, limit_);
    this.orderBy_ = this.validateOrderBy(orderBy);
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

    return new Criteria(
      expressionParsed,
      pagination ?? null,
      orderBy ?? [],
      limit ?? null,
    );
  }

  private validateOrderBy(orderBy: [unknown, Sort][]): OrderBy {
    if (!Array.isArray(orderBy)) {
      throw new Error('The orderBy must be a Array');
    }

    const orderBySanitized: OrderBy = new Map<string, Sort>([]);

    for (const criterion of orderBy) {
      if (!Array.isArray(criterion)) {
        throw new Error('The criterio of orderBy must be a array.');
      }

      const [field, sort] = criterion;

      if (sort !== 'DESC' && sort !== 'ASC') {
        throw new Error('The sort value must be ASC or DESC');
      }
      if (typeof field !== 'string') {
        throw new Error('The field order must be a string.');
      }
      orderBySanitized.set(field, sort);
    }

    return orderBySanitized;
  }

  private validatePaginationIntegrity(
    pagination: Pagination | null,
    limit: number | null,
  ) {
    if (pagination !== null && !(pagination instanceof Pagination)) {
      throw new Error(
        'The pagination must be a object of the type Pagination.',
      );
    }

    if (pagination !== null && !Number.isInteger(limit)) {
      throw new Error('To apply pagination you must to provide a limit.');
    }
  }

  private validateLimit(limit: number | null) {
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
      throw new Error('Limit must be a integer greater than or equal to 1.');
    }
  }

  set limit(limit: number | null) {
    this.validateLimit(limit);
    this.limit_ = limit;
  }

  get limit() {
    return this.limit_;
  }

  set orderBy(orderBy: [string, Sort][]) {
    this.orderBy_ = this.validateOrderBy(orderBy);
  }

  get orderBy(): [string, Sort][] {
    return Array.from(this.orderBy_.entries());
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
