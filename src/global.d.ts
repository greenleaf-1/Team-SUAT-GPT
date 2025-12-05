// Lightweight React/JSX shims to satisfy TypeScript when @types/react isn't installed
declare module 'react';
declare module 'react/jsx-runtime';

// Allow arbitrary JSX intrinsic elements to avoid "no interface 'JSX.IntrinsicElements'" errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

export {};
