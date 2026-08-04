import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';

const styles = {
  pageWrapper: { backgroundColor: '#000000', minHeight: '100vh', color: '#000000' },
  container: { maxWidth: '850px', margin: '30px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '6px', margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: 'Verdana' },
  content: { padding: '15px', fontSize: '11px', fontFamily: 'Verdana' },
  msgRow: { display: 'flex', gap: '15px', backgroundColor: '#ffe5d4', padding: '10px', border: '1px dashed #FF6600' },
  senderBox: { width: '80px', textAlign: 'center', flexShrink: 0 },
  username: { display: 'block', fontWeight: 'bold', color: '#FF6600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  avatar: { width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #000000', marginTop: '4px' }
};

export default function MessagesInboxPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchIncomingMessages();
    }
  }, [user]);

  const fetchIncomingMessages = async () => {
    try {
      setLoading(true);
      // Queries user_messages filtering receiver_id against the active account UUID
      const { data, error } = await supabase
        .from('user_messages')
        .select('*, profiles!user_messages_receiver_id_fkey(username, avatar_url)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading mailbox rows:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#FF6600', padding: '20px', fontFamily: 'Verdana', backgroundColor: '#000', minHeight: '100vh' }}>Reading secure mailbox streams...</div>;

  return (
    <div style={styles.pageWrapper}>
      <NavBar user={user} />
      <div style={styles.container}>
        <h2 style={styles.header}>ProfileDig // Private Mailbox Inbox</h2>
        <div style={styles.content}>
          {messages.length === 0 ? (
            <p style={{ color: '#666666', fontStyle: 'italic' }}>Your message box is currently empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={styles.msgRow}>
                  <div style={styles.senderBox}>
                    <span style={styles.username}>{msg.profiles?.username || 'Sender'}</span>
                    <img src={msg.profiles?.avatar_url || 'https://placehold.co'} alt="pic" style={styles.avatar} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '9px', color: '#666666', marginBottom: '5px' }}>
                      Received: {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Just Now'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', color: '#000000' }}>{msg.content}</div>
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
