import CriteriaError from './criteria-error.js';

export default class InvalidOrderBy extends CriteriaError {
  constructor(message?: string, received?: unknown) {
    super('InvalidOrderBy', message ?? 'Invalid OrderBy', received);
  }
}
