import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';

const styles = {
  pageWrapper: { backgroundColor: '#000000', minHeight: '100vh', color: '#000000' },
  container: { maxWidth: '850px', margin: '30px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '6px', margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: 'Verdana' },
  content: { padding: '15px', fontSize: '11px', fontFamily: 'Verdana' },
  msgRow: { display: 'flex', gap: '15px', backgroundColor: '#ffe5d4', padding: '10px', border: '1px dashed #FF6600', marginBottom: '15px', flexDirection: 'column' },
  messageHeader: { display: 'flex', gap: '15px', width: '100%' },
  senderBox: { width: '80px', textAlign: 'center', flexShrink: 0 },
  username: { display: 'block', fontWeight: 'bold', color: '#FF6600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  avatar: { width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #000000', marginTop: '4px' },
  replyBox: { borderTop: '1px dotted #FF6600', paddingTop: '10px', marginTop: '5px', width: '100%' },
  textarea: { width: '100%', height: '50px', border: '1px solid #000000', fontSize: '11px', padding: '5px', marginBottom: '4px', resize: 'none', backgroundColor: '#ffffff', color: '#000000' },
  emojiRow: { display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' },
  emojiBtn: { background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '2px' },
  buttonGroup: { display: 'flex', gap: '8px', marginTop: '8px' },
  button: { backgroundColor: '#FF6600', color: '#ffffff', border: '1px solid #000000', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#cc0000', color: '#ffffff', border: '1px solid #000000', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }
};

export default function MessagesInboxPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const emojiList = ['⭐', '😎', '🎸', '🔥', '💀', '👽', '✨', '🖤', '✌️', '💥', '👀', '💯'];

  useEffect(() => {
    // ⭐ SESSION FALLBACK SHIELD: Forces unauthenticated page visitors back to the login terminal
    if (user === null) {
      window.location.href = "/login";
      return;
    }

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
      console.error("Error loading mailbox rows:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e, receiverId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const { error } = await supabase.from('user_messages').insert([
      {
        sender_id: user.id,
        receiver_id: receiverId,
        content: replyText.trim()
      }
    ]);

    if (!error) {
      alert("Reply successfully sent!");
      setReplyText('');
      setActiveReplyId(null);
      fetchIncomingMessages();
    } else {
      alert("Failed to send reply: " + error.message);
    }
  };

  // ⭐ ADDED: Operational mailbox row item deletion function
  const handleDeleteMessage = async (messageId) => {
    const confirmDel = window.confirm("Are you sure you want to permanently delete this message from your inbox?");
    if (!confirmDel) return;

    const { error } = await supabase
      .from('user_messages')
      .delete()
      .eq('id', messageId);

    if (!error) {
      setMessages(messages.filter(msg => msg.id !== messageId));
    } else {
      alert("Failed to drop message record: " + error.message);
    }
  };

  const appendEmoji = (emoji) => {
    setReplyText(prev => prev + emoji);
  };

  if (loading) return <div style={{ color: '#FF6600', padding: '20px', fontFamily: 'Verdana', backgroundColor: '#000', minHeight: '100vh', textAlign: 'center', fontWeight: 'bold' }}>Reading secure mailbox streams...</div>;

    return (
    <div style={styles.pageWrapper}>
      <NavBar user={user} />
      <div style={styles.container}>
        <h2 style={styles.header}>BFRENZ // Private Mailbox Inbox</h2>
        <div style={styles.content}>
          {messages.length === 0 ? (
            <p style={{ color: '#666666', fontStyle: 'italic' }}>Your message box is currently empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={styles.msgRow}>
                  {/* Top Portion: Message Metadata Content Header */}
                  <div style={styles.messageHeader}>
                    <div style={styles.senderBox}>
                      <span style={styles.username}>{msg.profiles?.username || 'Sender'}</span>
                      {/* Fixed default placeholder fallback string URL */}
                      <img src={msg.profiles?.avatar_url || 'https://placehold.co'} alt="pic" style={styles.avatar} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '9px', color: '#666666', marginBottom: '5px' }}>
                        Received: {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Just Now'}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', color: '#000000' }}>{msg.content}</div>
                      
                      {/* Action Triggers Row Panel */}
                      <div style={styles.buttonGroup}>
                        <button 
                          onClick={() => {
                            if (activeReplyId === msg.id) {
                              setActiveReplyId(null);
                            } else {
                              setActiveReplyId(msg.id);
                              setReplyText('');
                            }
                          }}
                          style={{ ...styles.button, backgroundColor: '#000', color: '#FF6600' }}
                        >
                          {activeReplyId === msg.id ? 'Cancel' : 'Reply'}
                        </button>
                        
                        {/* New functional removal trigger button */}
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)} 
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ⭐ INLINE INTERACTIVE EMOJI REPLY FORM PANEL */}
                  {activeReplyId === msg.id && (
                    <div style={styles.replyBox}>
                      {/* Clickable Quick Emoji Picker Selection Matrix */}
                      <div style={styles.emojiRow}>
                        {emojiList.map(emo => (
                          <button 
                            key={emo} 
                            type="button" 
                            onClick={() => appendEmoji(emo)} 
                            style={styles.emojiBtn}
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                      
                      {/* Submission text container form */}
                      <form onSubmit={(e) => handleSendReply(e, msg.sender_id)}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your vintage response..."
                          style={styles.textarea}
                          required
                        />
                        <button type="submit" style={styles.button}>Send Response</button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 