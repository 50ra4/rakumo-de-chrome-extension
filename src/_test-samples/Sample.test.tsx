import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sample } from './Sample';

describe('Sample.tex', () => {
  test('render App component', () => {
    render(<Sample />);
    expect(screen.getByText('Sample Component')).toBeInTheDocument();
  });
});
