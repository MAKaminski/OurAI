/**
 * Branded (nominal) ID types. A `Brand<string, 'X'>` is still a string at
 * runtime but is not interchangeable with a differently-branded string at the
 * type level — so you cannot accidentally pass an `IdeaId` where a `SessionId`
 * is expected.
 */
declare const __brand: unique symbol;
export type Brand<T, B> = T & { readonly [__brand]: B };

export type CompanyId = Brand<string, 'CompanyId'>;
export type IdeaId = Brand<string, 'IdeaId'>;
export type WorkItemId = Brand<string, 'WorkItemId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type EventId = Brand<string, 'EventId'>;
export type UserId = Brand<string, 'UserId'>;

/** Cast a raw string to a branded id. Use at trust boundaries (DB rows, params). */
export const asId = <B extends string>(value: string): Brand<string, B> =>
  value as Brand<string, B>;
