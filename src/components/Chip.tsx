import type { ButtonHTMLAttributes } from 'react';
import styles from './Chip.module.css';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

export function Chip({ selected = false, className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={[styles.chip, selected && styles.selected, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
