import CriteriaError from './criteria-error.js';

export default class InvalidLimit extends CriteriaError {
  constructor(received?: string) {
    super(
      'InvalidLimit',
      `Limit must be an integer greater than or equal to 1`,
      received,
    );
  }
}
