import React from 'react';

type SummaryReportItem = {
  label: string;
  value: string;
};

type Props = {
  className?: string;
  title: string;
  items: SummaryReportItem[];
};

export const SummaryReport = ({ className, title, items }: Props) => {
  return (
    <section className={className}>
      <h3 style={{ margin: '10px 0' }}>{title}</h3>
      {items.map(({ label, value }, i) => (
        <div
          key={label}
          style={{
            display: 'flex',
            height: '20px',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #4c4b4b',
            backgroundColor: i % 2 ? '#eaf0ec' : '#ffffff',
          }}
        >
          <div>{label}</div>
          <div>{value}</div>
        </div>
      ))}
    </section>
  );
};
