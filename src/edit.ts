export interface MinimalReplacement {
  start: number;
  end: number;
  text: string;
}

export function computeMinimalReplacement(original: string, formatted: string): MinimalReplacement | undefined {
  if (original === formatted) {
    return undefined;
  }

  let start = 0;
  const sharedLength = Math.min(original.length, formatted.length);
  while (start < sharedLength && original.charCodeAt(start) === formatted.charCodeAt(start)) {
    start += 1;
  }

  let originalEnd = original.length;
  let formattedEnd = formatted.length;
  while (
    originalEnd > start &&
    formattedEnd > start &&
    original.charCodeAt(originalEnd - 1) === formatted.charCodeAt(formattedEnd - 1)
  ) {
    originalEnd -= 1;
    formattedEnd -= 1;
  }

  return {
    start,
    end: originalEnd,
    text: formatted.slice(start, formattedEnd),
  };
}
