export function roughTokens(value: unknown): number {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return Math.ceil(text.length / 4);
}

export function percentReduction(before: number, after: number): number {
  return before === 0 ? 0 : ((before - after) / before) * 100;
}
