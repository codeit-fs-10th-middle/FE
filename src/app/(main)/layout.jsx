import Header from '@/components/layout/Header';
import RandomPointManager from '@/components/organisms/RandomPoint/RandomPointManager';

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <RandomPointManager /> {/* ✅ 전역 랜덤 포인트 */}
      <main
        style={{
          minHeight: 'calc(100vh - 120px)',
          backgroundColor: '#000000',
          width: '100%',
        }}
      >
        {children}
      </main>
    </>
  );
}
