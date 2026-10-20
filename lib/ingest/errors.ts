/** Errors whose message is safe to show to the user. Anything else is treated as internal. */
export class IngestError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'IngestError';
  }
}
