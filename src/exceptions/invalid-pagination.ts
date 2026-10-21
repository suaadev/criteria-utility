import CriteriaError from './criteria-error.js';

export default class InvalidPagination extends CriteriaError {
  constructor(message?: string, received?: unknown) {
    super('InvalidPagination', message ?? 'Invalid pagination', received);
  }
}
