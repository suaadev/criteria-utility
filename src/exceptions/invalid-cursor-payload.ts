import CriteriaError from './criteria-error.js';

export default class InvalidCursorPayload extends CriteriaError {
  constructor(message?: string, received?: unknown) {
    super(
      'InvalidCursorPayload',
      message ?? `Cursor payload is invalid`,
      received,
    );
  }
}
