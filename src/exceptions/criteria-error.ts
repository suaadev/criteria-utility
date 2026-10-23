/* eslint-disable @typescript-eslint/no-base-to-string */

export default abstract class CriteriaError extends Error {
  private static readonly LIMIT_RECEIVED_OUTPUT = 40;
  constructor(name: string, message?: string, received?: unknown) {
    const receivedFormat: string = formatLargeOutput(
      toString(received),
      CriteriaError.LIMIT_RECEIVED_OUTPUT,
    );
    const receivedMessage =
      received !== undefined ? `, received: ${receivedFormat}` : '';
    super(`${message ?? `Criteria error`}${receivedMessage}`);
    this.name = name;
    this.cause = received;
  }
}

function toString(input: unknown): string {
  let output = '';
  if (typeof input === 'object') {
    output = JSON.stringify(input);
  } else if (typeof input === 'function') {
    output = input.toString();
  } else {
    output = String(input);
  }
  return output;
}

function formatLargeOutput(output: string, limitOutput: number): string {
  const finalOutput =
    output.length >= limitOutput
      ? `${output.slice(0, limitOutput)}...`
      : output;
  return finalOutput;
}
