import React from 'react';

type SummaryReportItem = {
  label: string;
  value: string;
};

type Props = {
  className?: string;
  items: SummaryReportItem[];
};

export const SummaryReport = ({ className, items }: Props) => {
  return (
    <div className={className}>
      {items.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex' }}>
          <div>{label}</div>
          <div>{value}</div>
        </div>
      ))}
    </div>
  );
};
