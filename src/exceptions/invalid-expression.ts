import CriteriaError from './criteria-error.js';

export default class InvalidExpression extends CriteriaError {
  constructor(message?: string, received?: unknown) {
    super('InvalidExpression', message ?? 'Invalid expression', received);
  }
}
