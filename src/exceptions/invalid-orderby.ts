export default class InvalidOrderBy extends Error {
  constructor(reason?: string, received?: string) {
    const reasonMessage = reason ? `, reason: ${reason}` : '';
    const receivedMessage = received ? `, received: "${received}"` : '';
    const message =
      `Invalid orderBy${reasonMessage}${receivedMessage}`.trim() + '.';
    super(message);
    this.name = 'InvalidOrderBy';
  }
}
