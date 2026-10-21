export default class InvalidPagination extends Error {
  constructor(reason?: string, received?: string) {
    const reasonMessage = reason ? `, reason: ${reason}` : '';
    const receivedMessage = received ? `, received: "${received}"` : '';
    const message =
      `Invalid pagination${reasonMessage}${receivedMessage}`.trim() + '.';
    super(message);
    this.name = 'InvalidPagination';
  }
}
