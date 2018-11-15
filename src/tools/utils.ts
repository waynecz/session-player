export function _now(): number {
  if (!window.performance) return Date.now()
  // if user change local time, performance.now() would work accurate still
  return Math.floor(performance.now())
}
