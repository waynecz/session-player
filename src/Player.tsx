import React, { Component } from 'react'
import style from './player.st.css';

export default class Player extends Component<{}, {}> {
  render() {
    return (
      <div {...style('root')}></div>
    )
  }
}