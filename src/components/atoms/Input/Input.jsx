// src/components/atoms/Input/Input.jsx
'use client';

import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(function Input({ type = 'text', className, ...props }, ref) {
  const resolvedClassName = className ? className : (styles.input ?? '');

  return <input ref={ref} type={type} className={resolvedClassName} {...props} />;
});

export default Input;
