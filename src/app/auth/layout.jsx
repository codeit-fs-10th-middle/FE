export default function AuthLayout({ children }) {
  return (
    <section
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%' }}>{children}</div>
    </section>
  );
}
