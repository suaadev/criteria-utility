export default class InvalidPage extends Error {
  constructor(received?: string) {
    const receivedMessage = received ? `, received: "${received}"` : '';
    const message =
      `Page must be an integer greater than or equal to 1${receivedMessage}`.trim() +
      '.';
    super(message);
    this.name = 'InvalidPage';
  }
}
