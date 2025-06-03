import React from 'react';

interface PageTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ children, className = '' }) => (
    <p
        className={`text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center md:text-left ${className}`}
    >
        {children}
    </p>
);