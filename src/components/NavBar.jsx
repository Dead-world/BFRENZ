import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .nav-links-container { display: flex !important; align-items: center !important; gap: 15px !important; }
    .burger-menu-btn { display: none !important; }
    
    /* 🎨 UNIFIED RETRO 3D ORANGE BUTTONS (EXACT DASHBOARD STYLE MATCH) */
    .retro-nav-btn {
      display: inline-flex !important;
      align-items: center !important;
      padding: 6px 14px !important;
      font-family: 'Courier New', monospace !important;
      font-weight: bold !important;
      font-size: 12px !important;
      text-transform: uppercase !important;
      text-decoration: none !important;
      color: #000000 !important;
      border: 2px solid #000000 !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      box-shadow: 3px 3px 0px #ffffff !important;
      transition: transform 0.05s ease, box-shadow 0.05s ease !important;
      background-color: #FF6600 !important;
    }
    .retro-nav-btn:active {
      transform: translate(2px, 2px) !important;
      box-shadow: 1px 1px 0px #ffffff !important;
    }
    .retro-nav-btn:hover {
      filter: brightness(1.1) !important;
    }

    /* 🔔 STANDALONE ORANGE VECTOR Activity BELL */
    .retro-bell-wrapper {
      display: inline-flex !important;
      align-items: center !important;
      padding: 4px !important;
      color: #FF6600 !important;
      position: relative !important;
      cursor: pointer !important;
    }

    /* 💬 RETRO CIRCULAR MESSENGER TRIGGER BADGE WITH WHITE SHADOW SEAM */
    .retro-messenger-circle {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      background-color: #2F3031 !important;
      color: #FF6600 !important;
      cursor: pointer !important;
      border: 2px solid #000000 !important;
      box-shadow: 2px 2px 0px #ffffff !important;
      transition: transform 0.05s ease, box-shadow 0.05s ease !important;
      position: relative !important;
    }
    .retro-messenger-circle:active {
      transform: translate(1px, 1px) !important;
      box-shadow: 1px 1px 0px #ffffff !important;
    }
    .retro-messenger-circle:hover {
      filter: brightness(1.2) !important;
    }
    .retro-messenger-circle svg {
      width: 20px !important;
      height: 20px !important;
      fill: currentColor !important;
    }

    /* 📊 RE-INJECTED: DYNAMIC ALERT UNREAD BADGES OVERRIDES */
    .bell-badge-indicator {
      position: absolute !important;
      top: -2px !important;
      right: -2px !important;
      background-color: #FF6600 !important;
      color: #000000 !important;
      font-size: 10px !important;
      font-weight: bold !important;
      min-width: 15px !important;
      height: 15px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: 1px solid #000000 !important;
      font-family: 'Courier New', monospace !important;
    }

    /* 📂 FLAT MODERN MESSENGER DROPDOWN POPUP PANEL */
    .messenger-dropdown-panel {
      position: absolute !important;
      top: 52px !important;
      right: 0 !important;
      width: 360px !important;
      background-color: #242526 !important;
      border-radius: 8px !important;
      padding: 16px 8px 8px 8px !important;
      box-sizing: border-box !important;
      border: none !important;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4) !important;
      z-index: 1000 !important;
    }
    .messenger-header-line { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 0 8px 12px 8px !important; }
    .messenger-header-title { font-size: 22px !important; font-weight: 800 !important; color: #ffffff !important; font-family: 'Segoe UI', sans-serif !important; }
    .messenger-chat-row { display: flex !important; align-items: center !important; gap: 12px !important; padding: 8px !important; border-radius: 8px !important; text-decoration: none !important; color: #E4E6EB !important; transition: background-color 0.2s !important; margin-bottom: 4px !important; cursor: pointer !important; }
    .messenger-chat-row:hover { background-color: #3A3B3C !important; }
    .messenger-chat-row.unread-item { background-color: rgba(24, 119, 242, 0.05) !important; }
    .chat-thumb-frame { position: relative !important; display: flex !important; }
    .chat-thumb-img { width: 48px !important; height: 48px !important; border-radius: 50% !important; object-fit: cover !important; background-color: #3A3B3C !important; }
    .chat-active-dot { position: absolute !important; bottom: 2px !important; right: 2px !important; width: 12px !important; height: 12px !important; background-color: #31A24C !important; border-radius: 50% !important; border: 2px solid #242526 !important; }
    .chat-body-block { flex: 1 !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; font-family: 'Segoe UI', sans-serif !important; }
    .chat-username-title { font-size: 14.5px !important; font-weight: 600 !important; color: #E4E6EB !important; text-align: left !important; }
    .unread-item .chat-username-title { color: #ffffff !important; }
    .chat-preview-row { display: flex !important; align-items: center !important; font-size: 12.5px !important; color: #B0B3B8 !important; margin-top: 3px !important; gap: 4px !important; }
    .unread-item .chat-preview-row { color: #1877F2 !important; font-weight: 600 !important; }
    .chat-text-truncate { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; max-width: 190px !important; text-align: left !important; }
    .chat-read-marker-dot { width: 8px !important; height: 8px !important; background-color: #1877F2 !important; border-radius: 50% !important; margin-left: auto !important; flex-shrink: 0 !important; }
    .messenger-see-all-btn { display: block !important; text-align: center !important; color: #1877F2 !important; font-size: 14px !important; font-weight: 600 !important; padding: 10px 0 2px 0 !important; text-decoration: none !important; border-top: 1px solid #393A3B !important; margin-top: 8px !important; font-family: 'Segoe UI', sans-serif !important; }
    .messenger-see-all-btn:hover { text-decoration: underline !important; }

    @keyframes pulse-alert {
      0%, 100% { filter: drop-shadow(0 0 2px #FF6600); }
      50% { filter: drop-shadow(0 0 8px #FF0000); }
    }
    .bell-alert-active { animation: pulse-alert 1.5s infinite; }

    @media (max-width: 768px) {
      .nav-links-container { 
        display: none !important; 
        flex-direction: column !important; 
        width: 100% !important; 
        background-color: #000000 !important; 
        border-top: 1px solid #FF6600 !important; 
        padding: 12px 0 !important; 
        margin-top: 10px !important; 
        gap: 12px !important; 
        align-items: center !important; 
      }
      .nav-links-container.open { 
        display: flex !important; 
      }
      .burger-menu-btn { 
        display: block !important; 
      }
      .retro-nav-btn { 
        width: 100% !important; 
        box-sizing: border-box !important; 
        justify-content: center !important; 
      }
      .retro-messenger-circle { 
        width: 100% !important; 
        max-width: 100% !important; 
        height: auto !important;
        padding: 12px 14px !important; 
        border-radius: 4px !important; 
        box-sizing: border-box !important; 
        justify-content: center !important; 
      }
      .messenger-dropdown-panel { 
        position: fixed !important; 
        top: 64px !important; 
        right: 10px !important; 
        width: calc(100% - 20px) !important; 
        max-width: 360px !important; 
      }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  nav: { backgroundColor: '#000000', padding: '15px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FF6600', fontFamily: "'Courier New', monospace", position: 'relative', zIndex: 1000 },
  logo: { color: '#FF6600', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' },
  burger: { background: 'none', border: '2px solid #FF6600', color: '#FF6600', fontSize: '18px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }
};

export default function NavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMsgDropdownOpen, setIsMsgDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    if (!user) return;

    // 📥 1. SYNC INITIAL CHAT ALERTS ON COMPONENT MOUNT
    fetchRecentInboxMessages();

    // 🔌 2. ATTACH REAL-TIME CONTEXT LISTENER FOR OUTSTANDING ROWS
    const msgSubscription = supabase
      .channel(`public:user_messages:nav_receiver=${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_messages', filter: `receiver_id=eq.${user.id}` },
        () => { fetchRecentInboxMessages(); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_messages', filter: `receiver_id=eq.${user.id}` },
        () => { fetchRecentInboxMessages(); }
      )
      .subscribe();

    // 📋 3. DETECT OUTSIDE WINDOW MOUSE CLICKS TO CLOSE DROPDOWN
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsMsgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      supabase.removeChannel(msgSubscription);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [user]);

  /* ⚙️ ENGINE ACTION: CORE LOGS QUERY RUNNER */
  const fetchRecentInboxMessages = async () => {
    if (!user) return;
    try {
      const { data: messagesData, error: msgError } = await supabase
        .from('user_messages')
        .select('id, sender_id, content, created_at, read')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      // Filter unread rows count
      const unreadRows = messagesData?.filter(m => !m.read) || [];
      setUnreadCount(unreadRows.length);

      if (!messagesData || messagesData.length === 0) {
        setRecentChats([]);
        return;
      }

      // Deduplicate recent chats based on sender_id
      const uniqueSenderMap = {};
      messagesData.forEach(msg => {
        if (!uniqueSenderMap[msg.sender_id]) {
          uniqueSenderMap[msg.sender_id] = msg;
        }
      });
      const deduplicatedMessages = Object.values(uniqueSenderMap).slice(0, 5);

      const senderIds = deduplicatedMessages.map(m => m.sender_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('User_id, username, avatar_url, status, last_online')
        .in('User_id', senderIds);

      const profileMap = (profilesData || []).reduce((acc, p) => {
        acc[p.User_id] = p;
        return acc;
      }, {});

      const transformedChats = deduplicatedMessages.map(m => {
        const senderProfile = profileMap[m.sender_id];
        const isProfileOnline = senderProfile?.status === 'online' || 
          (senderProfile?.last_online && (Date.now() - new Date(senderProfile.last_online).getTime() < 5 * 60 * 1000));

        return {
          id: m.id,
          sender_id: m.sender_id,
          username: senderProfile?.username || 'Anonymous Friend',
          avatar_url: senderProfile?.avatar_url || 'https://placeholder.com',
          last_message: m.content,
          is_unread: !m.read,
          is_online: isProfileOnline
        };
      });

      setRecentChats(transformedChats);
    } catch (err) {
      console.error('Failed to parse dynamic navbar dropdown threads:', err);
    }
  };

  /* 🧼 TRANSACTION ACTIONS: MARK AS OPENED AND NAVIGATE OUT */
  const handleOpenChatAction = async (chatItem) => {
    try {
      await supabase
        .from('user_messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', chatItem.sender_id);

      setIsMsgDropdownOpen(false);
      fetchRecentInboxMessages();
      navigate(`/profile/${chatItem.sender_id}`);
    } catch (err) {
      console.error('Failed to apply message notification clear action:', err);
    }
  };

    return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>bfrenz</Link>
      
      <button className="burger-menu-btn" style={styles.burger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? "✕" : "☰"}
      </button>

      <div className={`nav-links-container ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" className="retro-nav-btn">Dashboard</Link>
        
        {user ? (
          <>
            {/* 🔔 STANDALONE ORANGE NAVIGATION BELL ELEMENT */}
            <div className={`retro-bell-wrapper ${unreadCount > 0 ? 'bell-alert-active' : ''}`} ref={dropdownRef}>
              <div className="retro-messenger-circle" onClick={() => setIsMsgDropdownOpen(!isMsgDropdownOpen)}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 2.22.73 4.27 1.96 5.93L3.05 21l3.22-.95C7.81 20.67 9.83 21 12 21c5.48 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                </svg>
                {unreadCount > 0 && <span className="bell-badge-indicator">{unreadCount}</span>}
              </div>

              {/* 📂 FLAT RETRO DROPDOWN CONTAINER WRAPPER POPUP */}
              {isMsgDropdownOpen && (
                <div className="messenger-dropdown-panel">
                  <div className="messenger-header-line">
                    <span className="messenger-header-title">Chats</span>
                  </div>

                  {recentChats.length === 0 ? (
                    <div style={{ color: '#b0b3b8', fontSize: '13px', padding: '16px', fontFamily: '"Segoe UI", sans-serif', textAlign: 'center', fontWeight: '600' }}>
                      No recent messages found.
                    </div>
                  ) : (
                    recentChats.map(chat => (
                      <div 
                        key={chat.id} 
                        className={`messenger-chat-row ${chat.is_unread ? 'unread-item' : ''}`}
                        onClick={() => handleOpenChatAction(chat)}
                      >
                        <div className="chat-thumb-frame">
                          <img src={chat.avatar_url} alt="Avatar" className="chat-thumb-img" />
                          {chat.is_online && <div className="chat-active-dot"></div>}
                        </div>
                        <div className="chat-body-block">
                          <span className="chat-username-title">{chat.username}</span>
                          <div className="chat-preview-row">
                            <span className="chat-text-truncate">{chat.last_message}</span>
                          </div>
                        </div>
                        {chat.is_unread && <div className="chat-read-marker-dot"></div>}
                      </div>
                    ))
                  )}
                  <Link to="/dashboard" className="messenger-see-all-btn" onClick={() => setIsMsgDropdownOpen(false)}>
                    See all in Dashboard
                  </Link>
                </div>
              )}
            </div>

            <button className="retro-nav-btn" onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="retro-nav-btn">Log In</Link>
            <Link to="/register" className="retro-nav-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
