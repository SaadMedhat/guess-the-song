/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 */
export const fisherYatesShuffle = <T>(array: ReadonlyArray<T>): Array<T> => {
  const result = [...array]
  result.reduceRight((_, current, index) => {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const temp = result[index]!
    result[index] = result[randomIndex]!
    result[randomIndex] = temp
    return null
  }, null)
  return result
}
