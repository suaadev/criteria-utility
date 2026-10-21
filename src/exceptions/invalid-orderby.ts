import CriteriaError from './criteria-error.js';

export default class InvalidOrderBy extends CriteriaError {
  constructor(message?: string, received?: string) {
    super('InvalidOrderBy', message ?? 'Invalid OrderBy', received);
  }
}
