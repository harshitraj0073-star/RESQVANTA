/**
 * Class name merging utility (lightweight, zero-dep)
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === "string") return input.split(/\s+/);
      return Object.entries(input)
        .filter(([_, val]) => Boolean(val))
        .map(([key]) => key);
    })
    .filter(Boolean)
    .join(" ");
}
