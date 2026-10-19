export default class InvalidCursorPayload extends Error {
  constructor(reason?: string, received?: string) {
    const reasonMessage = reason ? `, reason: ${reason}` : '';
    const receivedMessage = received ? `, received: "${received}"` : '';
    const message =
      `Cursor payload is invalid${reasonMessage}${receivedMessage}`.trim() +
      '.';
    super(message);
    this.name = 'InvalidCursorPayload';
  }
}
