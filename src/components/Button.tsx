import React from 'react';

type Props = {
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

export function Button({ disabled, children, onClick }: Props) {
  return (
    <button
      style={{
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
