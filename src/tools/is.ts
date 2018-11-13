export function isFunction(sth: any): boolean {
  return typeof sth === 'function'
}

export function isErrorEvent(sth: any): boolean {
  return Object.prototype.toString.call(sth) === '[object ErrorEvent]'
}

export function isError(sth: any): boolean {
  switch (Object.prototype.toString.call(sth)) {
    case '[object Error]':
      return true
    case '[object Exception]':
      return true
    case '[object DOMException]':
      return true
    default:
      return sth instanceof Error
  }
}
