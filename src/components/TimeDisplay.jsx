import React from 'react'
import styled from 'styled-components'
const MS_IN_H = 3600000
const MS_IN_M = 60000
const MS_IN_S = 1000

const StyledSpan = styled.span`
  color: ${props => props.theme.color.text2};
  font-weight: bold;
  font-size: 3rem;
  font-family: 'courier prime', 'courier new', monospace;

  @media (min-width: 500px) {
    font-size: 8rem;
  }
`
export const getTimeString = (time, showHours) => {
  const hoursValue = showHours ? Math.floor(time / MS_IN_H) : 0
  const minutesValue = Math.floor((time - hoursValue * MS_IN_H) / MS_IN_M)
  const secondsValue = Math.ceil(
    (time - (hoursValue * MS_IN_H + minutesValue * MS_IN_M)) / MS_IN_S
  )

  const addZero = value => value.toString().padStart(2, '0')
  const hours = addZero(hoursValue)
  const minutes = addZero(minutesValue)
  const seconds = addZero(secondsValue)
  const times = [hours, minutes, seconds]
  const sliceIndex = showHours ? 0 : 1
  return times.slice(sliceIndex).join(':')
}

const TimeDisplay = ({ time, showHours, ...props }) => {
  return <StyledSpan {...props}>{getTimeString(time, showHours)}</StyledSpan>
}

export default TimeDisplay
