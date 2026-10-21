export default abstract class CriteriaError extends Error {
  constructor(name: string, message?: string, received?: string) {
    const receivedMessage = received ? `, received: "${received}"` : '';
    super(`${message ?? `Criteria error`}${receivedMessage}`);
    this.name = name;
    this.cause = received;
  }
}
