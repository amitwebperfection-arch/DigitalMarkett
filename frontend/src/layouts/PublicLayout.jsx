import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';

function PublicLayout() {
  return (
    <>
      <Navbar />
      <CartDrawer /> 

    <main className="container mx-auto px-4 min-h-screen">
    <Outlet />
    </main>

      <Footer />
    </>
  );
}

export default PublicLayout;
