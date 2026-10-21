import CriteriaError from './criteria-error.js';

export default class InvalidPagination extends CriteriaError {
  constructor(message?: string, received?: string) {
    super('InvalidPagination', message ?? 'Invalid pagination', received);
  }
}
