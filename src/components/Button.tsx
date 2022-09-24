import React from 'react';

type Props = {
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

export function Button({ className, disabled, children, onClick }: Props) {
  return (
    <button
      className={className}
      style={{
        flex: '1 1 auto',
        padding: '7px 16px 6px',
        borderRadius: '4px',
        background: '#f6f6f6',
        border: '1px solid #c2cacc',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? '0.5' : '1',
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
