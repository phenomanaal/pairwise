// components/LoginForm.tsx
import React from 'react';

interface Section {
  title: string;
  children: React.ReactNode;
}

interface BoxProps {
  sections: Section[];
  width?: string;
}

const Box: React.FC<BoxProps> = ({ sections, width = 'sm' }) => {
  const standardSizes = [
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
    'xs',
    '2xs',
    '3xs',
  ];

  const isStandardSize = standardSizes.includes(width);

  let maxWidth: string;
  let maxWidthClass = '';

  if (isStandardSize) {
    maxWidthClass = `max-w-${width}`;
  } else {
    if (!isNaN(Number(width))) {
      maxWidth = `${width}rem`;
    } else if (
      width.endsWith('px') ||
      width.endsWith('rem') ||
      width.endsWith('%')
    ) {
      maxWidth = width;
    } else {
      maxWidthClass = 'max-w-md';
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      {sections.map((section: Section, index) => (
        <div
          key={index}
          className={`bg-white p-8 rounded-2xl w-full border border-black mx-5 ${maxWidthClass}`}
          style={maxWidth ? { maxWidth } : undefined}
        >
          <h2 className="text-2xl font-semibold text-center text-black mb-6">
            {section.title}
          </h2>
          {section.children}
        </div>
      ))}
    </div>
  );
};

export default Box;
