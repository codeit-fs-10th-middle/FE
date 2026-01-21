export default function MainLayout({ children }) {
  // RootLayout(`src/app/layout.jsx`)에서 이미 Header/Footer를 렌더링하므로
  // (main) 그룹 레이아웃에서는 children만 렌더링합니다.
  return children;
}
