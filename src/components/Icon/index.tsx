import React from 'react'
import MuiIcon, { IconProps } from '@material-ui/core/Icon'
import BEMProvider from 'tools/bem-classname'

type props = {
  name: string
  large?: boolean
} & IconProps

const SEMANTIC_ICON_MAP = {
  next_step: 'redo',
  play: 'play_arrow'
}

const bem = BEMProvider('icon')

export default function Icon({ name, large = false, ...muiProps }: props) {
  return (
    <MuiIcon {...bem({ large })} {...muiProps}>
      {SEMANTIC_ICON_MAP[name] || name}
    </MuiIcon>
  )
}
