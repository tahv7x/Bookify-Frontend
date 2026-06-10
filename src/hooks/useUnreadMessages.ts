import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getUnreadCount } from '../services/Client/messageService';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        if (isMounted) setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread count', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000); // Check every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Si on est sur la page des messages, on masque la notification (elle sera lue par l'API)
  if (location.pathname.toLowerCase().includes('/messages')) {
    return 0;
  }

  return unreadCount;
};
