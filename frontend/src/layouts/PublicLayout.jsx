import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';

function PublicLayout() {
  return (
    <>
      <Navbar />
      <CartDrawer /> 

      <main className="container mx-auto px-4 md:px-6 lg:px-8 min-h-screen py-4 md:py-6">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default PublicLayout;