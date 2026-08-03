import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';

export default function MessagesInbox() {
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
      const { data, error } = await supabase
        .from('user_messages')
        .select('*, profiles!user_messages_sender_id_fkey(username, avatar_url)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

    if (loading) return <div style={{ color: '#FF6600', padding: '20px', fontFamily: 'Verdana', backgroundColor: '#000', minHeight: '100vh' }}>Reading mailbox streams...</div>;

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#000000' }}>
      <NavBar user={user} />
      <div style={{ maxWidth: '850px', margin: '30px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' }}>
        <h2 style={{ backgroundColor: '#FF6600', color: '#ffffff', padding: '6px', margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: 'Verdana' }}>
          ProfileDig // Private Mailbox Inbox
        </h2>
        <div style={{ padding: '15px', fontSize: '11px', fontFamily: 'Verdana' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#666666', fontStyle: 'italic' }}>Your message box is currently empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', gap: '15px', backgroundColor: '#ffe5d4', padding: '10px', border: '1px dashed #FF6600' }}>
                  <div style={{ width: '80px', textAlign: 'center', flexShrink: 0 }}>
                    <span style={{表达: 'block', fontWeight: 'bold', color: '#FF6600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.profiles?.username || 'User'}
                    </span>
                    <img 
                      src={msg.profiles?.avatar_url || 'https://placehold.co'} 
                      alt="sender avatar" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #000000', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '9px', color: '#666666', marginBottom: '5px' }}>
                      Received: {new Date(msg.created_at).toLocaleString()}
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
