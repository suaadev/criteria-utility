import CriteriaError from './criteria-error.js';

export default class InvalidPage extends CriteriaError {
  constructor(received?: string) {
    super(
      'InvalidPage',
      'Page must be an integer greater than or equal to 1',
      received,
    );
  }
}
