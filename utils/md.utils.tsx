import { Components } from 'react-markdown';
import React from 'react';

const PreComponent: Components['pre'] = ({ children, ...props }) => {
  return (
    <pre className="whitespace-pre-wrap break-words overflow-x-auto" {...props}>
      {children}
    </pre>
  );
};

const CodeComponent: Components['code'] = ({
  className,
  children,
  ...props
}) => {
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export const markdownComponents: Components = {
  p: ({ children, ...props }) => (
    <p
      style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
      {...props}
    >
      {children}
    </p>
  ),
  pre: PreComponent,
  code: CodeComponent,
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
};
