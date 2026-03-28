import { css } from 'styled-components';
import { BORDER_RADIUS, COLORS, FONT_WEIGHTS, SHADOWS, TRANSITIONS } from '../../../theme';

export const buttonStyles = css`
  transition: all ${TRANSITIONS.normal};
  border-radius: ${BORDER_RADIUS.md};
  font-weight: ${FONT_WEIGHTS.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${SHADOWS.buttonHover};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${SHADOWS.button};
  }
`;

export const cardHoverStyles = css`
  transition: all ${TRANSITIONS.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${SHADOWS.cardHover};
  }
`;

export const glassEffectStyles = css`
  background: ${COLORS.glassBg};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${COLORS.glassBorder};
`;
