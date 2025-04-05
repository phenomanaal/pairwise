// components/LoginForm.tsx
import React from 'react';

interface Section {
  title: string,
  children: React.ReactNode;
}


interface BoxProps {
  sections: Section[];
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const Box: React.FC<BoxProps> = ({ sections, width = 'sm' }) => {
  const maxWidthClass = `max-w-${width}`

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      {
        sections.map((section: Section, index) => (
          <div key={index} className={`bg-white p-8 rounded-2xl w-full ${maxWidthClass} border border-black mx-5`}>
            <h2 className="text-2xl font-semibold text-center text-black mb-6">{section.title}</h2>
            {section.children}
          </div>
        ))
      }
      
    </div>
  );
};

export default Box;
