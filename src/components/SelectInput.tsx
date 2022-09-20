import React from 'react';

type Props<T extends string> = {
  value: T;
  options: { name: string; value: T }[];
  onChange: (value: T) => void;
};

export function SelectInput<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <select
      style={{ height: '28px' }}
      value={value}
      onChange={(e) => {
        onChange(e.target.value as T);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
