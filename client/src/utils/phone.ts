/** Keeps digits only: "(902) 555-0100" becomes "9025550100". */
export const digitsOnly = (v: string) => v.replace(/\D/g, "");

/** The last 10 digits, so "+1 902-555-0100" and "902 555 0100" count as the same number. */
const last10 = (v: string) => digitsOnly(v).slice(-10);

/** True if both numbers are the same phone number. Used to stop the family contact matching your own. */
export const samePhone = (a: string, b: string) => last10(a).length === 10 && last10(a) === last10(b);

/** A North American number: 10 digits, optionally starting with 1. */
export const PHONE_REGEX = /^1?\d{10}$/;
export const isValidPhone = (v: string) => PHONE_REGEX.test(digitsOnly(v));