import React from 'react';

type EventCardProps = {
  title: string;
  desc: string;
  date?: string;
  location?: string;
  canJoin?: boolean;
};

export default function EventCard({ title, desc, date, location, canJoin }: EventCardProps) {
  return (
    <div className="border rounded-lg flex flex-col space-y-7 place-items-center sm:flex-row p-4 sm:space-y-0 sm:space-x-7 bg-white shadow-md dark:bg-gray-900 dark:border-gray-700">
      <div className="h-32 w-32 bg-gray-200 rounded-md dark:bg-gray-700">

      </div>

      <div className=''>
        <h3 className="text-xl font-bold dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {desc}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {date} - {location}
        </p>
        { canJoin && <button
         className="min-w-24 w-1/3 flex justify-center py-2 px-4 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
        >
          Partecipa
            
        </button>
        }
      </div>
    </div>
  );
}
