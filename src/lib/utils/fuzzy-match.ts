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
  const cols = b.length + 1
  const initialRow = Array.from({ length: cols }, (_, i) => i)

  const finalRow = Array.from(a).reduce<ReadonlyArray<number>>(
    (prev, charA, rowIdx) => {
      const row = Array.from(b).reduce<ReadonlyArray<number>>(
        (curr, charB, colIdx) => {
          const cost = charA === charB ? 0 : 1
          const value = Math.min(
            (prev[colIdx + 1] ?? 0) + 1,
            (curr[colIdx] ?? 0) + 1,
            (prev[colIdx] ?? 0) + cost
          )
          return [...curr, value]
        },
        [rowIdx + 1]
      )
      return row
    },
    initialRow
  )

  return finalRow[b.length] ?? Infinity
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
  if (normalizedAnswer.includes(normalizedTarget) && normalizedTarget.length >= 3)
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
