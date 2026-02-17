import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './features/auth/auth.slice';
import AppRoutes from './routes';
import MaintenanceGuard from './components/common/MaintenanceGuard'; 

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setUser({ user, token }));
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return(

    <MaintenanceGuard>
      <AppRoutes />
    </MaintenanceGuard>
  )

   
}

export default App;