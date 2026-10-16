import { ExpressionRaw } from './filter/basic-grammar.js';
import * as FilterParser from './filter/filter-parser.js';
import { Expression } from './filter/grammar.js';
import Pagination from './pagination.js';

export type Sort = 'ASC' | 'DESC';

export type OrderByRaw<T> = ([keyof T, Sort] | [string, Sort])[];

type OrderBy<T> = Map<keyof T | string, Sort>;

export interface CriteriaOptions<T> {
  filter?: ExpressionRaw<T> | Record<string, unknown> | null;
  pagination?: Pagination | null;
  orderBy?: OrderByRaw<T> | null;
  limit?: number | null;
}

export class Criteria<T = unknown> {
  private orderBy_: OrderBy<T>;

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

  private validateOrderBy(orderBy: OrderByRaw<T>): OrderBy<T> {
    if (!Array.isArray(orderBy)) {
      throw new Error('The orderBy must be a Array');
    }

    const orderBySanitized: OrderBy<T> = new Map<string, Sort>([]);

    for (const criterion of orderBy) {
      if (!Array.isArray(criterion)) {
        throw new Error('The criterio of orderBy must be a array.');
      }

      if (criterion.length !== 2) {
        throw new Error(
          'The criterion must contain only two elements, field and sort.',
        );
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
    this.validatePaginationIntegrity(this.pagination_, limit);
    this.limit_ = limit;
  }

  get limit() {
    return this.limit_;
  }

  set orderBy(orderBy: OrderByRaw<T>) {
    this.orderBy_ = this.validateOrderBy(orderBy);
  }

  get orderBy(): [string | keyof T, Sort][] {
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
