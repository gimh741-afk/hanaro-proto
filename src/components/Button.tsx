import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tint';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** 기본값 true: 부모 너비를 꽉 채운다 (Figma 350 = 390 - 좌우 20) */
  block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', block = true, className, type = 'button', ...rest },
  ref,
) {
  const cls = [styles.button, styles[variant], block && styles.block, className].filter(Boolean).join(' ');
  return <button ref={ref} type={type} className={cls} {...rest} />;
});
