/**
 * Normalize a string for comparison: lowercase, strip punctuation, trim.
 */
const normalize = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()

/**
 * Levenshtein distance between two strings.
 */
const levenshtein = (a: string, b: string): number => {
  const rows = a.length + 1
  const cols = b.length + 1

  const prev = Array.from({ length: cols }, (_, i) => i)
  const curr = Array.from({ length: cols }, () => 0)

  return Array.from({ length: a.length }, (_, i) => i).reduce((_, rowIdx) => {
    curr[0] = rowIdx + 1

    Array.from({ length: b.length }, (__, j) => j).reduce((__, colIdx) => {
      const cost = a[rowIdx] === b[colIdx] ? 0 : 1
      curr[colIdx + 1] = Math.min(
        (prev[colIdx + 1] ?? 0) + 1,
        (curr[colIdx] ?? 0) + 1,
        (prev[colIdx] ?? 0) + cost
      )
      return null
    }, null)

    prev.splice(0, prev.length, ...curr)
    return null
  }, null) as unknown as number

  // The result is in prev[b.length] after all iterations
  return prev[b.length] ?? Infinity
}

/**
 * Get the max allowed Levenshtein distance based on word length.
 */
const getMaxDistance = (word: string): number => {
  if (word.length <= 3) return 0
  if (word.length <= 6) return 1
  if (word.length <= 10) return 2
  return 3
}

/**
 * Check if the answer is a fuzzy match for the target.
 */
const isFuzzyWordMatch = (answer: string, target: string): boolean => {
  const normalizedAnswer = normalize(answer)
  const normalizedTarget = normalize(target)

  if (normalizedAnswer === normalizedTarget) return true
  if (normalizedTarget.includes(normalizedAnswer) && normalizedAnswer.length >= 3)
    return true

  const distance = levenshtein(normalizedAnswer, normalizedTarget)
  const maxDist = getMaxDistance(normalizedTarget)
  return distance <= maxDist
}

/**
 * Check if the user's answer matches either the song title or the artist name.
 * Returns true if either matches with fuzzy tolerance.
 */
export const checkAnswer = (
  answer: string,
  titleShort: string,
  artistName: string
): boolean => {
  if (answer.trim().length === 0) return false
  return (
    isFuzzyWordMatch(answer, titleShort) ||
    isFuzzyWordMatch(answer, artistName)
  )
}
