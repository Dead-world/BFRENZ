import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function NavBar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ⭐ REAL-TIME NOTIFICATIONS COUNTER BADGE LISTENERS
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to immediate real-time database modifications streams
    const notificationsSubscription = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsSubscription);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      if (user) {
        await supabase.from("profiles").update({ status: "offline", last_seen: new Date().toISOString() }).eq("User_id", user.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  return (
    <nav style={{ backgroundColor: '#000000', padding: '8px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FF6600', fontFamily: 'Verdana, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" onClick={() => setIsOpen(false)}>
          <img src="/ProfileDigLogo.png" alt="ProfileDig" style={{ height: '60px', width: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#FF6600; font-weight:bold; font-size:14px;">ProfileDig</span>'; }} />
        </Link>
      </div>

      <div className={`nav-links-container ${isOpen ? 'open' : ''}`} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/" style={{ color: '#ffffff', textDecoration: 'none' }}>Home</Link>
        <Link to="/browse" style={{ color: '#ffffff', textDecoration: 'none' }}>Browse</Link>
        
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: '#ffffff', textDecoration: 'none' }}>Dashboard</Link>
            
            {/* ⭐ ALERTS NOTIFICATION BADGE LINK */}
            <Link to="/notifications" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: unreadCount > 0 ? 'bold' : 'normal' }}>
              Notifications {unreadCount > 0 && <span style={{ backgroundColor: '#FF6600', color: '#000', padding: '1px 5px', fontSize: '10px', borderRadius: '3px', marginLeft: '3px' }}>{unreadCount}</span>}
            </Link>

            <Link to="/inbox" style={{ color: '#ffffff', textDecoration: 'none' }}>Inbox</Link>
            <Link to={`/profile/${user.id}`} style={{ color: '#FF6600', textDecoration: 'none', fontWeight: 'bold' }}>My Profile</Link>
            <button onClick={handleLogout} style={{ backgroundColor: '#FF6600', color: '#ffffff', border: '1px solid #ffffff', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#FF6600', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
            <Link to="/register" style={{ color: '#ffffff', textDecoration: 'none' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
