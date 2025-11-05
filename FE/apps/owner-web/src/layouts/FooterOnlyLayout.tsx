import { Outlet } from 'react-router-dom';
import Footer from '../components/ui/Footer';

export default function FooterOnlyLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 overflow-y-auto pb-20 px-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
