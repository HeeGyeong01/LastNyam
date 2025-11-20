import { Outlet } from 'react-router-dom';
import Header from '../components/ui/owner/Header';
import Footer from '../components/ui/owner/Footer';

export default function QRScanLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden pt-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

