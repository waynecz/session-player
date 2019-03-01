import { useState, useEffect } from 'react'
import { observable, observe } from 'mobx'
import { Record } from 'session-recorder/dist/models/observers'

type StoreGetter = {
  criticalActionIndexs: number[]
  recordList: Record[]
  referer: string
  sessionInfo: any
  loaded: boolean
  error: boolean
  fullScreen: boolean
}

type StoreSetter = {
  loadRecorderData(records: Record[], ref: string, info?: any): void

  setCriticalActionIndexs(actions: any[]): void
  setRecordList(records: Record[]): void
  setReferer(ref: string): void
  setSessionInfo(info: any): void
  setError(val: boolean): void
  setFullScreen(val: boolean): void
}

type StoreStruct = StoreGetter & StoreSetter

class StoreClass implements StoreStruct {
  @observable
  public criticalActionIndexs: number[] = []

  @observable
  public recordList: Record[] = []

  @observable
  public referer: string = ''

  @observable
  public sessionInfo: any = {}

  @observable
  public loaded: boolean = false

  @observable
  public error: boolean = false

  @observable
  public fullScreen: boolean = false


  public loadRecorderData = (list: Record[], ref: string, info?: any): void => {
    this.recordList = list
    this.referer = ref
    this.sessionInfo = info
    this.loaded = true
  }

  public setCriticalActionIndexs = (actions: any[]): void => {
    this.criticalActionIndexs = actions
  }

  public setRecordList = (list: Record[]): void => {
    this.recordList = list
  }

  public setReferer = (ref: string): void => {
    this.referer = ref
  }

  public setSessionInfo = (info: any): void => {
    this.sessionInfo = info
  }

  public setError = (val: boolean): void => {
    this.error = val
  }

  public setFullScreen = (val: boolean): void => {
    this.fullScreen = val
  }
}

const Store: StoreStruct = new StoreClass()

export const useStore = <T = any>(key: keyof StoreGetter, cb?: any): T => {
  const [value, setValue] = useState<T>(Store[key] as any)

  useEffect(
    () => {
      observe(
        Store,
        key,
        (): void => {
          setValue(Store[key] as any)

          cb && cb(Store[key])
        },
        true
      )
    },
    [key, cb]
  )

  return value
}

export default Store
