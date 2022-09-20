import React from 'react';

export function TextInput({
  id,
  name,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label
        htmlFor={id}
        style={{ marginRight: '4px', width: '120px', fontWeight: 'bold', fontSize: '14px' }}
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value);
        }}
        style={{ flex: '1 1 auto' }}
      />
    </div>
  );
}
