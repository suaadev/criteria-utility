import InvalidLimit from './exceptions/invalid-limit.js';
import InvalidOrderBy from './exceptions/invalid-orderby.js';
import InvalidPagination from './exceptions/invalid-pagination.js';
import { ExpressionRaw } from './filter/basic-grammar.js';
import * as FilterParser from './filter/filter-parser.js';
import { Expression } from './filter/grammar.js';
import Pagination from './pagination.js';

type OrderBy = Map<string, Sort>;

export type Sort = 'ASC' | 'DESC';

export type OrderByRaw<T> = ([keyof T, Sort] | [string, Sort])[];

export interface CriteriaOptions<T> {
  filter?: ExpressionRaw<T> | Record<string, unknown> | null;
  pagination?: Pagination | null;
  orderBy?: OrderByRaw<T> | null;
  limit?: number | null;
}

export class Criteria<T = unknown> {
  private orderBy_: OrderBy;

  private constructor(
    readonly filterExpression: Expression | null,
    private pagination_: Pagination | null,
    orderBy: OrderByRaw<T>,
    private limit_: number | null,
  ) {
    this.validateLimit(limit_);
    this.validatePaginationIntegrity(pagination_, limit_);
    this.orderBy_ = this.validateOrderBy(orderBy);
  }

  static build<T>(criteriaOptions: CriteriaOptions<T> = {}) {
    const { filter, limit, orderBy, pagination } = criteriaOptions;

    const filterExpression = filter ? FilterParser.parse(filter) : null;

    return new Criteria<T>(
      filterExpression,
      pagination ?? null,
      orderBy ?? [],
      limit ?? null,
    );
  }

  private validateOrderBy(orderBy: OrderByRaw<T>): OrderBy {
    if (!Array.isArray(orderBy)) {
      throw new InvalidOrderBy('The orderBy must be an array', orderBy);
    }

    const orderBySanitized: OrderBy = new Map<string, Sort>([]);

    for (const criterion of orderBy) {
      if (!Array.isArray(criterion)) {
        throw new InvalidOrderBy(
          'The criterion of orderBy must be an array',
          criterion,
        );
      }

      if (criterion.length !== 2) {
        throw new InvalidOrderBy(
          'The criterion must contain only two elements, field and sort',
          criterion,
        );
      }

      const [field, sort] = criterion;

      if (sort !== 'DESC' && sort !== 'ASC') {
        throw new InvalidOrderBy('The sort value must be ASC or DESC', sort);
      }
      if (typeof field !== 'string') {
        throw new InvalidOrderBy('The field order must be a string', field);
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
      throw new InvalidPagination(
        'The pagination must be an object of the type Pagination',
        pagination,
      );
    }

    if (pagination !== null && !Number.isInteger(limit)) {
      throw new InvalidPagination(
        'To apply pagination you must provide a limit',
      );
    }
  }

  private validateLimit(limit: number | null) {
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
      throw new InvalidLimit(limit);
    }
  }

  set limit(limit: number | null) {
    this.validateLimit(limit);
    this.validatePaginationIntegrity(this.pagination_, limit);
    this.limit_ = limit;
  }

  get limit() {
    return this.limit_;
  }

  set orderBy(orderBy: OrderByRaw<T>) {
    this.orderBy_ = this.validateOrderBy(orderBy);
  }

  get orderBy(): [string, Sort][] {
    return Array.from(this.orderBy_.entries());
  }

  set pagination(pagination: Pagination | null) {
    this.validatePaginationIntegrity(pagination, this.limit_);
    this.pagination_ = pagination;
  }

  get pagination(): Pagination | null {
    return this.pagination_;
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
