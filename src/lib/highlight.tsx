/**
 * highlight.tsx
 *
 * Returns a React node array with every occurrence of `term` wrapped in a
 * styled span. Used inside the virtualised table so performance matters.
 *
 * WHY NO REGEX?
 * User-supplied strings can contain regex metacharacters (".", "(", etc.) that
 * would throw or match incorrectly. A plain `indexOf` loop is both safer and
 * faster for single-term matching.
 *
 * WHY JSX NODES AND NOT DANGEROUSLYSETINNERHTML?
 * dangerouslySetInnerHTML with an unsanitised search term is an XSS vector.
 * Returning real React nodes is safe by construction — React escapes text.
 *
 * PERFORMANCE NOTE:
 * This function is called once per visible row in the virtualiser. For a
 * 141 k-row dataset with ~20 rows visible, that's ~20 calls per render —
 * negligible. Memoisation at the call site is therefore intentionally omitted
 * to keep the API surface simple.
 */

import React from "react";

/**
 * Splits `text` on every occurrence of `term` (case-insensitive) and returns
 * an array of React nodes — plain strings for non-matching parts, and styled
 * `<mark>` elements for matching parts.
 *
 * Returns the original string unchanged if `term` is empty or not found.
 */
export function highlightMatch(
  text: string,
  term: string,
): React.ReactNode {
  const trimmed = term.trim();
  if (!trimmed) return text;

  const termLower = trimmed.toLowerCase();
  const textLower = text.toLowerCase();
  const nodes: React.ReactNode[] = [];

  let cursor = 0;
  let keyIndex = 0;

  while (cursor < text.length) {
    const matchIndex = textLower.indexOf(termLower, cursor);

    if (matchIndex === -1) {
      nodes.push(text.slice(cursor));
      break;
    }

    // Text before the match
    if (matchIndex > cursor) {
      nodes.push(text.slice(cursor, matchIndex));
    }

    // The matched portion — use <mark> for semantic correctness + screen readers
    nodes.push(
      <mark
        key={keyIndex++}
        className="bg-transparent text-primary font-semibold not-italic"
      >
        {text.slice(matchIndex, matchIndex + trimmed.length)}
      </mark>,
    );

    cursor = matchIndex + trimmed.length;
  }

  return nodes.length === 0 ? text : nodes;
}