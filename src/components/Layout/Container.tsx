import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '' }) => (
    <div className={`w-full md:max-w-10/12 py-4 px-2 ${className}`}>
        {children}
    </div>
);