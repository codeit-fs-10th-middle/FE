'use client';

export default function ButtonBase({ children, className = '', disabled = false, ...props }) {
  return (
    <button {...props} disabled={disabled} className={className}>
      {children}
    </button>
  );
}