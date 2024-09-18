import ms from "ms";

/**
 * Get the expiration date for a JWT token.
 * @param expiresIn The expiration time for the token, in milliseconds or a string accepted by `ms()`.
 * @example
 * ```ts
 * expires("1d")
 * // => 2024-04-25T14:11:33.000Z
 * expires("1m").getTime()
 * // => 1681373293000
 * ```
 */
export function expires(expiresIn: string) {
  return new Date(Date.now() + ms(expiresIn));
}
