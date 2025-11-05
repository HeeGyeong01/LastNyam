import { Outlet } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export default function HeaderFooterLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto pt-16 pb-20 px-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
