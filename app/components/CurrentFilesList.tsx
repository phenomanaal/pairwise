'use client';  // Ensure this is a client-side component

const CurrentFilesList = () => {
    return (
        <div>
            <p>You uploaded the following files successfully:</p>
            <ul className="space-y-2 pt-5">
            <li className="flex items-center">
                <span className="ml-2">Voter File: </span ><span className="ml-2 italic">test.csv</span>
            </li>
        </ul>
    </div>
  );
};

export default CurrentFilesList;