import InvalidLimit from './exceptions/invalid-limit.js';
import InvalidOrderBy from './exceptions/invalid-orderby.js';
import InvalidPagination from './exceptions/invalid-pagination.js';
import { ExpressionNode } from './filter/ast.js';
import * as FilterParser from './filter/filter-parser.js';
import { Expression, ValidValueTypes } from './filter/grammar.js';
import Pagination from './pagination.js';

type OrderBy = Map<string, Sort>;

export type Sort = 'ASC' | 'DESC';

export type OrderByRaw<T> = [T extends object ? keyof T : string, Sort][];

export interface CriteriaOptions<
  T extends Record<string, ValidValueTypes> = Record<string, ValidValueTypes>,
> {
  filter?: Expression<T> | null;
  pagination?: Pagination | null;
  orderBy?: OrderByRaw<T> | null;
  limit?: number | null;
}

export class Criteria<
  T extends Record<string, ValidValueTypes> = Record<string, ValidValueTypes>,
> {
  private orderBy_: OrderBy;

  private constructor(
    private filterExpression_: ExpressionNode | null,
    private pagination_: Pagination | null,
    orderBy: OrderByRaw<T>,
    private limit_: number | null,
  ) {
    this.validateLimit(limit_);
    this.validatePaginationIntegrity(pagination_, limit_);
    this.orderBy_ = this.validateOrderBy(orderBy);
    Object.freeze(this);
  }

  /**
   * @deprecated use Criteria.create instead
   */
  static build<
    T extends Record<string, ValidValueTypes> = Record<string, ValidValueTypes>,
  >(criteriaOptions: CriteriaOptions<NoInfer<T>> = {}) {
    return Criteria.create<T>(criteriaOptions);
  }

  static create<
    T extends Record<string, ValidValueTypes> = Record<string, ValidValueTypes>,
  >(criteriaOptions: CriteriaOptions<NoInfer<T>> = {}) {
    const { filter, limit, orderBy, pagination } = criteriaOptions;

    const filterExpression = filter ? FilterParser.parse(filter) : null;

    const criteria = new Criteria<T>(
      filterExpression,
      pagination ?? null,
      orderBy ?? [],
      limit ?? null,
    );

    return criteria;
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

  get orderBy() {
    return Object.freeze(Array.from(this.orderBy_.entries()));
  }

  get limit(): Readonly<number | null> {
    return this.limit_;
  }

  get pagination(): Readonly<Pagination | null> {
    return Object.freeze(this.pagination_);
  }

  get filterExpression(): Readonly<ExpressionNode | null> {
    return Object.freeze(this.filterExpression_);
  }

  toObjectPlain() {
    return Object.freeze({
      filterExpression: this.filterExpression,
      pagination: this.pagination_?.toObjectPlain() ?? null,
      orderBy: this.orderBy,
      limit: this.limit,
    });
  }
}
