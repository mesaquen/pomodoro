import styled from 'styled-components'

const Button = styled.button`
border: 1px solid ${props => props.theme.color.primary};
background: ${props => props.theme.color.primary};
padding: ${props=> props.theme.spacing(4)} ${props=> props.theme.spacing(8)};
color: white;
cursor: pointer;
font-size: 2.25rem;
font-weight: 600;
text-transform: uppercase;
border-radius:  ${props=> props.theme.spacing(1)};
outline: none;

:hover {
    background: '#444'
}
`

export default Button