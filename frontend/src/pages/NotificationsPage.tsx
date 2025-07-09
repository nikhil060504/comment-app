import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

const API_URL = 'http://localhost:3000'; // Change if backend runs elsewhere

const NotificationsPage: React.FC<{ token: string }> = ({ token }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err: any) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [token]);

  const markRead = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {}
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Notifications</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {loading ? <div>Loading...</div> : notifications.length === 0 ? <div>No notifications.</div> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map(n => (
            <li key={n.id} style={{ marginBottom: 12, background: n.read ? '#f6f6f6' : '#e6f7ff', padding: 12, borderRadius: 6 }}>
              <div>{n.message}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
              {!n.read && <button onClick={() => markRead(n.id)} style={{ marginTop: 4 }}>Mark as read</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage; 