import React from 'react';

type EventCardProps = {
  title: string;
  desc: string;
  date?: string;
  location?: string;
};

export default function EventCard({ title, desc, date, location }: EventCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-md dark:bg-gray-900 dark:border-gray-700">
      <div className="h-32 bg-gray-200 rounded-md mb-4 dark:bg-gray-700"></div>
      <h3 className="text-xl font-bold dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        {desc}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {date} - {location}
      </p>
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Partecipa
      </button>
    </div>
  );
}
