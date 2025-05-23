'use client';

const WelcomeChecklist = () => {
  return (
    <div>
      <p>
        To get started, please follow this checklist to ensure that you are
        ready to perform PairWise list matching.
      </p>
      <ul className="space-y-2 pt-5">
        <li className="flex items-center">
          <input
            type="checkbox"
            checked
            className="w-5 h-5 text-black bg-black-100 border-black-300 rounded-md cursor-default"
            disabled
          />
          <span className="ml-2">lorem ipsum</span>
        </li>
        <li className="flex items-center">
          <input
            type="checkbox"
            checked
            className="w-5 h-5 text-black bg-black-100 border-black-300 rounded-md cursor-default"
            disabled
          />
          <span className="ml-2">lorem ipsum</span>
        </li>
        <li className="flex items-center">
          <input
            type="checkbox"
            checked
            className="w-5 h-5 text-black bg-black-100 border-black-300 rounded-md cursor-default"
            disabled
          />
          <span className="ml-2">lorem ipsum</span>
        </li>
      </ul>
    </div>
  );
};

export default WelcomeChecklist;
