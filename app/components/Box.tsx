import React from 'react';
import ProgressIndicator from './ProgressIndicator';

interface Section {
  title: string | React.ReactElement;
  children: React.ReactNode;
}

interface BoxProps {
  sections: Section[];
  width?: string;
  showProgress?: boolean;
}

const Box: React.FC<BoxProps> = ({ sections, width = 'sm', showProgress = true }) => {
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
    <div className="min-h-screen bg-white flex flex-col pt-16">
      {showProgress && <ProgressIndicator />}
      <div className="flex-1 flex justify-center items-center bg-white">
        {sections.map((section: Section, index) => (
          <div
            key={index}
            className={`bg-white p-8 rounded-2xl border border-black mx-5 ${maxWidthClass}`}
            style={maxWidth ? { maxWidth, width: maxWidth } : undefined}
          >
            <h2 className="text-2xl font-semibold text-center text-black mb-6">
              {section.title}
            </h2>
            {section.children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Box;
