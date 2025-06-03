import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '' }) => (
    <div className={`bg-gray-100 dark:bg-gray-900 w-full md:max-w-10/12 pb-4 px-2 ${className}`}>
        {children}
    </div>
);