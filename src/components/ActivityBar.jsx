import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  margin-bottom: 1rem;
`

const Item = styled.div`
  cursor: pointer;
  display: flex;
  alflex: 1;
  padding: 1rem;
  font-size: 1rem;
  color: ${props =>
    props.selected ? 'white' : props.theme.color.text1};
  background: ${props => (props.selected ? props.theme.color.text1 : 'white')};
  transition: all 0.5s ease;
`

const ActivityBar = ({ data, activeItem, onClick }) => {
  const handleClick = item => {
    return onClick?.call(null, item)
  }
  return (
    <Container>
      {data.map(item => (
        <Item key={item} onClick={() => handleClick(item)} selected={activeItem === item}>
          <span>{item}</span>
        </Item>
      ))}
    </Container>
  )
}

export default ActivityBar
