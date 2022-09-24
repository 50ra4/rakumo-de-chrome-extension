import React, { useState } from 'react';

type Props = {
  id: string;
  title: string;
  disabled?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
};

const createAccordionHeaderId = (id: string) => `accordion-${id}-header`;
const createAccordionSectionId = (id: string) => `accordion-${id}-section`;

export function Accordion({ id, title, disabled, defaultExpanded, children }: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const headerId = createAccordionHeaderId(id);
  const sectionId = createAccordionSectionId(id);

  return (
    <section>
      <button
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '32px',
          padding: '4px',
          backgroundColor: '#ffffff',
          border: 'none',
          cursor: disabled ? 'default' : 'pointer',
        }}
        id={headerId}
        aria-controls={sectionId}
        aria-disabled={!isExpanded}
        aria-expanded={isExpanded}
        onClick={() => {
          if (disabled) return;
          setIsExpanded(!isExpanded);
        }}
      >
        <h3
          style={{
            display: 'block',
            flex: '1 1 auto',
            lineHeight: '32px',
            height: '32px',
            textAlign: 'left',
            verticalAlign: 'middle',
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '4px',
          }}
        >
          {title}
        </h3>
        <span
          style={{
            color: '#888a8d',
            fontSize: '12px',
            fontWeight: 'bold',
            width: '72px',
          }}
        >
          {isExpanded ? '非表示にする' : '表示する'}
        </span>
      </button>
      <div
        style={
          isExpanded
            ? {
                margin: '4px',
                padding: '4px',
                transition: 'height 0.3s, opacity 0.3s linear',
                height: 'auto',
                opacity: '1',
              }
            : {
                overflow: 'hidden',
                height: '0',
                opacity: '0',
              }
        }
        id={sectionId}
        aria-labelledby={headerId}
      >
        {children}
      </div>
    </section>
  );
}
