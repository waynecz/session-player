import React, { Component } from 'react'

import RecorderList from './modules/RecordList'
import Toolbar from './modules/Toolbar'
import Screen from './modules/Screen'
import Controller from './modules/Controller'

export default class Player extends Component<{}, {}> {
  render() {
    return (
      <section>
        <RecorderList/>
        <Toolbar/>
        <Screen/>
        <Controller/>
      </section>
    )
  }
}