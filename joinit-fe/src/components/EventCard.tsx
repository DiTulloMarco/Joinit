import React from 'react';

type EventCardProps = {
  title: string;
  desc: string;
  date?: string;
  location?: string;
  canJoin?: boolean;
  url?: string;
};

export default function EventCard(props: EventCardProps) {
  return (
    <div className="border rounded-lg flex flex-col space-y-7 place-items-center sm:flex-row p-4 sm:space-y-0 sm:space-x-7 bg-white shadow-md dark:bg-gray-900 dark:border-gray-700">
      <div className="min-w-32 h-32 w-32 bg-gray-200 rounded-md dark:bg-gray-700">

      </div>

      <div className=''>
        <h3 className="text-xl font-bold dark:text-white">{props.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {props.desc}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {props.date} - {props.location}
        </p>
        { props.canJoin && 
        <a href={props.url} className="primary-button mt-2 !w-1/3">
          Partecipa
            
        </a>
        }
      </div>
    </div>
  );
}
