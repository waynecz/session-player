import * as React from 'react'

import RecorderList from './modules/RecordList'
import Toolbar from './modules/Toolbar'
import Screen from './modules/Screen'
import Controller from './modules/Controller'

import { hot, setConfig } from 'react-hot-loader'

setConfig({ pureSFC: true } as any)

@hot(module)
export default class Layout extends React.Component<{}, {}> {
  render() {
    return (
      <section className="player">
        <RecorderList/>
        <Toolbar/>
        <Screen/>
        <Controller/>
      </section>
    )
  }
}
