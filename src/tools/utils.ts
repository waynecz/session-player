export function _now(): number {
  if (!window.performance) {
    return Date.now();
  }
  // if user change local time, performance.now() would work accurate still
  return Math.floor(performance.now());
}

export function _throttle<T, K>(
  func: (T: T) => K,
  wait: number = 100
): (T?: T) => K | void {
  let previous: number = _now();

  return function(this: any, ...args: any[]): K | void {
    const now = _now();
    const restTime = now - previous;

    if (restTime >= wait) {
      previous = now;
      return func.apply(this, args);
    }
  };
}

export function _safeDivision(
  molecular: any,
  denominator: any,
  def: number = 1
): number {
  const result = molecular / denominator;
  return isNaN(result) ? def : result;
}

export function _ms2Duration(ms: number): string {
  const durationInSec = Math.ceil(ms / 1000);

  const mm = ~~(durationInSec / 60);
  const ss = ~~(durationInSec % 60);

  return `${mm}:${ss < 10 ? '0' + ss : ss}`;
}
