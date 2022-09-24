import React from 'react';

type Props<T extends string> = {
  className?: string;
  value: T;
  options: { name: string; value: T }[];
  onChange: (value: T) => void;
};

export function SelectInput<T extends string>({ className, value, options, onChange }: Props<T>) {
  return (
    <select
      className={className}
      style={{ height: '36px' }}
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
