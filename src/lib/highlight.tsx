/**
 * highlight.tsx
 *
 * Utility for rendering text with a search term highlighted inside it.
 *
 * WHY NOT REGEX?
 * Regex with user input is dangerous — characters like "." or "(" would break
 * the pattern. We use a plain indexOf loop instead, which is also faster.
 *
 * WHY JSX AND NOT A STRING?
 * We need actual DOM elements around the matched portion so we can style it.
 * A plain string can't carry styling.
 */

import React from "react";

/**
 * Splits `text` on every occurrence of `term` (case-insensitive) and returns
 * an array of React nodes — plain strings for non-matching parts, and styled
 * spans for matching parts.
 *
 * If `term` is empty or not found, returns the original text as a single node.
 *
 * Example:
 *   highlightMatch("EY Advisory Ltd", "ey")
 *   → [<span className="...">EY</span>, " Advisory Ltd"]
 */
export function highlightMatch(text: string, term: string): React.ReactNode {
  if (!term.trim()) return text;

  const termLower = term.toLowerCase();
  const textLower = text.toLowerCase();
  const nodes: React.ReactNode[] = [];

  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = textLower.indexOf(termLower, cursor);

    if (matchIndex === -1) {
      // No more matches — push the rest of the string as plain text
      nodes.push(text.slice(cursor));
      break;
    }

    // Push any plain text before the match
    if (matchIndex > cursor) {
      nodes.push(text.slice(cursor, matchIndex));
    }

    // Push the matched portion as a styled span
    nodes.push(
      <span
        key={matchIndex}
        className="text-primary font-semibold"
      >
        {text.slice(matchIndex, matchIndex + term.length)}
      </span>
    );

    cursor = matchIndex + term.length;
  }

  return nodes.length === 0 ? text : nodes;
}