import React from 'react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

export const Templates = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Templates Management</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Coming Soon</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The Templates feature is currently under development.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Templates;
