// components/LoginForm.tsx
import React from 'react';

interface Section {
  title: string,
  children: React.ReactNode;
}


interface BoxProps {
  sections: Section[];
}

const Box: React.FC<BoxProps> = ({ sections }) => {

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      {
        sections.map((section: Section, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl w-full max-w-sm border border-black mx-5">
            <h2 className="text-2xl font-semibold text-center text-black mb-6">{section.title}</h2>
            {section.children}
          </div>
        ))
      }
      
    </div>
  );
};

export default Box;
