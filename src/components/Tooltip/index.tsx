import React from 'react'
import MuiTooltip, { TooltipProps } from '@material-ui/core/Tooltip'

type props = {} & TooltipProps

export default function Tooltip({ children, ...tooltipProps }: props) {
  return <MuiTooltip {...tooltipProps}>{children}</MuiTooltip>
}
