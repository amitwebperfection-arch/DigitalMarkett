import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../features/auth/auth.slice';
import { authService } from '../services/auth.service';

export const useUserRefresh = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || !token) return;

    const refreshUserData = async () => {
      try {
        const data = await authService.getProfile();
        
      
        dispatch(setUser({ user: data.user, token }));
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };

    
    refreshUserData();

    
    const interval = setInterval(refreshUserData, 30000);

    return () => clearInterval(interval);
  }, [user?.id, token, dispatch]);
};