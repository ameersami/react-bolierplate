import * as React from 'react';

import { ButtonProps } from '../../declerations/Button.d';
import StyledButton from './Button.styled';

const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps) => (
  <StyledButton onClick={props.onClick}>
    {props.label}
  </StyledButton>
);

Button.defaultProps = {
  label: 'Hello World',
  onClick: (e) => {}
};

export default Button;