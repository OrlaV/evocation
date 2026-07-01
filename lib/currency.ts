/* Display-only currency conversion. Charging is always in GBP at checkout;
   this just shows an approximate secondary price so international buyers have a
   rough idea. Rates are static and intentionally labelled "approx". */
export type CurrencyCode = "GBP" | "EUR" | "USD";

export const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; rate: number; label: string }
> = {
  GBP: { symbol: "£", rate: 1, label: "GBP" },
  EUR: { symbol: "€", rate: 1.17, label: "EUR" },
  USD: { symbol: "$", rate: 1.27, label: "USD" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

// approximate converted amount from GBP pence, e.g. "€69"
export function approxPrice(pence: number, code: CurrencyCode): string {
  const { symbol, rate } = CURRENCIES[code];
  const val = (pence / 100) * rate;
  return `${symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)}`;
}
