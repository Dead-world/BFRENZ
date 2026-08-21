import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🔔 RETRO HEADER NAV PILL LAYOUT BRICK KEYS */
    .nb-frame { background-color: #111112; border-bottom: 2px solid #FF6600; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; font-family: 'Courier New', monospace; box-shadow: 0 4px 0 #000; position: relative; z-index: 1000; }
    .nb-brand { color: #FF6600; font-size: 24px; font-weight: bold; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; }
    .nb-menu { display: flex; align-items: center; gap: 20px; }
    .nb-link { color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; }
    .nb-link:hover { color: #FF6600; }
    
    /* DYNAMIC BELL WRAPPER PANEL COMPONENTS */
    .nb-bell-container { position: relative; cursor: pointer; display: flex; align-items: center; padding: 4px; }
    .nb-bell-icon { font-size: 20px; color: #ffffff; transition: color 0.15s ease; }
    .nb-bell-icon:hover { color: #FF6600; }
    .nb-badge { position: absolute; top: -4px; right: -4px; background-color: #FF6600; color: #000000; font-size: 11px; font-weight: bold; min-width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #000000; padding: 1px; box-sizing: border-box; }
    
    /* 📦 RETRO FLOATING DROPDOWN LIST OVERLAY */
    .nb-dropdown { position: absolute; top: 100%; right: 0; margin-top: 10px; width: 320px; background-color: #111112; border: 2px solid #FF6600; box-shadow: 4px 4px 0px #ffffff; border-radius: 4px; padding: 10px; display: flex; flex-direction: column; gap: 8px; z-index: 99999; }
    .nb-dropdown-header { font-size: 12px; font-weight: bold; color: #FF6600; border-bottom: 1px solid #333; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .nb-item-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 3px; text-decoration: none; background-color: #1a1a1c; border: 1px solid transparent; transition: border-color 0.15s ease; cursor: pointer; }
    .nb-item-row:hover { border-color: #FF6600; }
    .nb-row-avatar { width: 36px; height: 36px; border-radius: 4px; border: 1px solid #FF6600; object-fit: cover; background-color: #222; }
    .nb-row-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .nb-row-meta { display: flex; justify-content: space-between; align-items: center; }
    .nb-row-user { font-size: 12px; font-weight: bold; color: #ffffff; }
    .nb-row-text { font-size: 11px; color: #b0b3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nb-row-time { font-size: 10px; color: #666; font-weight: bold; }
    .nb-unread-dot { width: 6px; height: 6px; background-color: #FF6600; border-radius: 50%; flex-shrink: 0; }
    
    .nb-empty-state { text-align: center; font-size: 12px; color: #666; padding: 20px 10px; font-weight: bold; }
  `;
  document.head.appendChild(styleEl);
}

export default function NavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 📥 1. SYNC INITIAL ALERTS DATA ON COMPONENT MOUNT
    fetchUnreadAlertsLedger();

    // 🔌 2. ATTACH SUPABASE REAL-TIME SUBSCRIBER LISTENER FOR INCOMING MESSAGES
    const realTimeMessageSubscription = supabase
      .channel(`public:user_messages:receiver=${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          // Play retro sound effect or trigger count refresh loop immediately
          fetchUnreadAlertsLedger();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          fetchUnreadAlertsLedger();
        }
      )
      .subscribe();

    // 📋 3. LISTEN TO OUTSIDE USER CLICKS TO AUTOMATICALLY CLOSE PANEL
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      supabase.removeChannel(realTimeMessageSubscription);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [user]);

  /* ⚙️ TRANSACTION MANAGER: FETCH UNREAD CHATS AND PROFILE CORRELATIONS */
  const fetchUnreadAlertsLedger = async () => {
    if (!user) return;
    try {
      // Pull down unread notifications
      const { data: messages, error: msgError } = await supabase
        .from('user_messages')
        .select('id, sender_id, content, created_at, read')
        .eq('receiver_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      setUnreadCount(messages?.length || 0);

      if (!messages || messages.length === 0) {
        setNotifications([]);
        return;
      }

      // Deduplicate alert items grouped per unique sender
      const distinctSenderMap = {};
      messages.forEach(msg => {
        if (!distinctSenderMap[msg.sender_id]) {
          distinctSenderMap[msg.sender_id] = msg;
        }
      });
      const uniqueAlertRows = Object.values(distinctSenderMap);

      // Collect user profiles metrics data definitions
      const senderIds = uniqueAlertRows.map(m => m.sender_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('User_id, username, avatar_url')
        .in('User_id', senderIds);

      const profileLookupMap = (profiles || []).reduce((acc, p) => {
        acc[p.User_id] = p;
        return acc;
      }, {});

      // Transform rows map into UI render format
      const operationalNotifications = uniqueAlertRows.map(m => {
        const sender = profileLookupMap[m.sender_id];
        return {
          id: m.id,
          senderId: m.sender_id,
          username: sender?.username || 'Anonymous Friend',
          avatarUrl: sender?.avatar_url || 'https://placeholder.com',
          previewText: m.content,
          timeString: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

      setNotifications(operationalNotifications);
    } catch (err) {
      console.error('Failed to parse dynamic navbar dropdown threads:', err);
    }
  };

  /* 🧼 CORE HANDLER: CLEAR ALERTS LOG & ROUTE TO SPECIFIC USER CHATBOX */
  const handleAlertInteractionAction = async (notificationItem) => {
    try {
      // Reset the "read" flag state on matching rows within the table logs database
      await supabase
        .from('user_messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', notificationItem.senderId);

      setIsDropdownOpen(false);
      fetchUnreadAlertsLedger(); // Refresh count badge

      // Navigate to the user's dashboard messaging array interface hub
      navigate(`/profile/${notificationItem.senderId}`);
    } catch (err) {
      console.error('Failed to apply message notification clear action:', err);
    }
  };

  return (
    <nav className="nb-frame">
      <Link to="/" className="nb-brand">bfrenz</Link>
      
      <div className="nb-menu">
        <Link to="/dashboard" className="nb-link">Dashboard</Link>
        
        {user && (
          /* 🔔 NOTIFICATIONS BELL DROPDOWN HUB WRAPPER */
          <div className="nb-bell-container" ref={dropdownRef}>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ position: 'relative' }}>
              <span className="nb-bell-icon">🔔</span>
              {unreadCount > 0 && <span className="nb-badge">{unreadCount}</span>}
            </div>

            {/* FLOATING RETRO MENU LOGS LIST */}
            {isDropdownOpen && (
              <div className="nb-dropdown">
                <div className="nb-dropdown-header">📥 Incoming Member Messages</div>
                
                {notifications.length === 0 ? (
                  <div className="nb-empty-state">No unread alerts in feed tray.</div>
                ) : (
                  notifications.map(item => (
                    <div 
                      key={item.id} 
                      className="nb-item-row" 
                      onClick={() => handleAlertInteractionAction(item)}
                    >
                      <img src={item.avatarUrl} alt="User node avatar" className="nb-row-avatar" />
                      <div className="nb-row-content">
                        <div className="nb-row-meta">
                          <span className="nb-row-user">{item.username}</span>
                          <span className="nb-row-time">{item.timeString}</span>
                        </div>
                        <span className="nb-row-text">{item.previewText}</span>
                      </div>
                      <div className="nb-unread-dot"></div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
