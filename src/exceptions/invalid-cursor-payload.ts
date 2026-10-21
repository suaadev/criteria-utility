import CriteriaError from './criteria-error.js';

export default class InvalidCursorPayload extends CriteriaError {
  constructor(message?: string, received?: string) {
    super(
      'InvalidCursorPayload',
      message ?? `Cursor payload is invalid`,
      received,
    );
  }
}
