import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';

const styles = {
  pageWrapper: { backgroundColor: '#000000', minHeight: '100vh', color: '#000000', fontFamily: 'Verdana' },
  container: { maxWidth: '850px', margin: '30px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '6px', margin: 0, fontSize: '13px', fontWeight: 'bold' },
  alertRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffe5d4', padding: '10px', border: '1px dashed #FF6600', marginBottom: '10px' },
  button: { backgroundColor: '#FF6600', color: '#ffffff', border: '1px solid #000000', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' },
  clearBtn: { backgroundColor: '#000000', color: '#FF6600', border: '1px solid #FF6600', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) { window.location.href = "/login"; return; }
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*, profiles!notifications_sender_id_fkey(username, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setAlerts(data);
    } catch (err) {
      console.error("Failed to load notification assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ FIXED: Adds permanent two-way friend connection insertion AND absolute row purge
  const handleAcceptFriend = async (alertItem) => {
    try {
      // 1. Establish mutual layout connections inside your database friends table
      const { error: fErr } = await supabase
        .from('friends')
        .insert([
          { user_id: user.id, friend_id: alertItem.sender_id },
          { user_id: alertItem.sender_id, friend_id: user.id }
        ]);

      if (fErr) throw fErr;

      // 2. ⭐ DATABASE SYNC FIX: Erase the notification row permanently so it stays accepted
      const { error: dErr } = await supabase
        .from('notifications')
        .delete()
        .eq('id', alertItem.id);

      if (dErr) throw dErr;
      
      alert("Friend link connected successfully!");
      setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertItem.id));
    } catch (err) {
      console.error(err);
      alert("Verification Exception: " + err.message);
    }
  };

  // ⭐ FIXED: Transmits persistent UPDATE command targeting your exact row token index
  const handleMarkAsRead = async (alertId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      setAlerts(prevAlerts => prevAlerts.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error("Failed to persist unread update flags: ", err.message);
    }
  };

  // ⭐ FIXED: Transmits persistent DELETE payload parameters straight to Supabase
  const handleDismissNotification = async (alertId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertId));
    } catch (err) {
      console.error("Failed to run persistent clear: ", err.message);
    }
  };

  if (loading) return <div style={{ color: '#FF6600', padding: '20px', backgroundColor: '#000', minHeight: '100vh', textAlign: 'center', fontWeight: 'bold' }}>Reading notification signals...</div>;

    return (
    <div style={styles.pageWrapper}>
      <NavBar user={user} />
      <div style={styles.container}>
        <h2 style={styles.header}>ProfileDig // Action Alert Control Hub</h2>
        <div style={{ padding: '15px' }}>
          {alerts.length === 0 ? (
            <p style={{ color: '#666666', fontStyle: 'italic', margin: 0 }}>No pending notifications or action requests.</p>
          ) : (
            <div>
              {alerts.map((item) => (
                <div key={item.id} style={{ ...styles.alertRow, opacity: item.is_read ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
                    <img src={item.profiles?.avatar_url || 'https://placehold.co'} alt="Pic" style={{ width: '35px', height: '34px', objectFit: 'cover', border: '1px solid #000' }} />
                    <div>
                      <b style={{ color: '#FF6600' }}>{item.profiles?.username || 'User'}</b> 
                      {item.type === 'message' ? ' transmitted a secure private message row.' : ' requested to link up as a Top Friend connection.'}
                      <span style={{ display: 'block', fontSize: '9px', color: '#777', marginTop: '2px' }}>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {item.type === 'friend_request' && (
                      <button onClick={() => handleAcceptFriend(item)} style={styles.button}>Accept</button>
                    )}
                    {item.type === 'message' && (
                      <button onClick={() => { handleMarkAsRead(item.id); navigate('/inbox'); }} style={styles.button}>View Inbox</button>
                    )}
                    {!item.is_read && (
                      <button onClick={() => handleMarkAsRead(item.id)} style={{ ...styles.clearBtn, color: '#000', borderColor: '#000', backgroundColor: 'transparent' }}>Mark Read</button>
                    )}
                    <button onClick={() => handleDismissNotification(item.id)} style={{ ...styles.clearBtn, backgroundColor: '#000' }}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
