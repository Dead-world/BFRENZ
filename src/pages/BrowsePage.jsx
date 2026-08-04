import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';

const styles = {
  pageWrapper: { backgroundColor: '#000000', minHeight: '100vh', color: '#000000' },
  container: { maxWidth: '1100px', margin: '30px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '6px 10px', margin: 0, fontSize: '14px', fontWeight: 'bold', fontFamily: 'Verdana' },
  searchBox: { border: '1px solid #000000', backgroundColor: '#ffe5d4', padding: '12px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' },
  input: { padding: '6px', border: '1px solid #000000', fontSize: '12px', fontFamily: 'Verdana', flexGrow: 1 },
  button: { backgroundColor: '#FF6600', color: '#ffffff', border: '1px solid #000000', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px', marginTop: '15px' },
  userCard: { border: '1px solid #000000', padding: '10px', backgroundColor: '#ffffff', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: '120px', height: '120px', objectFit: 'cover', border: '1px solid #000000', marginBottom: '8px' },
  usernameLink: { color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' },
  statusText: { fontSize: '11px', color: '#555555', fontStyle: 'italic', margin: '4px 0', minHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  infoLabel: { fontSize: '10px', color: '#000000', margin: '2px 0' }
};

export default function BrowsePage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

      if (!error && data) {
        setProfiles(data);
      } else if (error) {
        console.error("Browse query failed:", error.message);
      }
    } catch (err) {
      console.error("Error connecting to profile feeds:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(prof => 
    (prof.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prof.hometown || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prof.status_message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ color: '#FF6600', padding: '20px', fontFamily: 'Verdana', backgroundColor: '#000', minHeight: '100vh', textAlign: 'center', fontWeight: 'bold' }}>SCANNING BROWSE CHANNELS...</div>;

    return (
    <div style={styles.pageWrapper}>
      <NavBar user={user} />
      
      <div style={styles.container}>
        <h2 style={styles.header}>ProfileDig // Browse Users Matrix Network</h2>
        
        <div style={{ padding: '15px', fontFamily: 'Verdana' }}>
          
          {/* Functional Search Filter Bar */}
          <div style={styles.searchBox}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>Filter Matrix:</span>
            <input 
              type="text" 
              placeholder="Search by username, hometown, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.input}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ ...styles.button, backgroundColor: '#000' }}>
                Clear
              </button>
            )}
          </div>

          <p style={{ fontSize: '11px', margin: '0 0 10px 0' }}>
            Showing <b>{filteredProfiles.length}</b> verified user spaces across the network.
          </p>

          {/* User Results Grid Mapping Loop */}
          {filteredProfiles.length === 0 ? (
            <div style={{ border: '1px dashed #FF6600', padding: '20px', textAlign: 'center', backgroundColor: '#ffe5d4', color: '#cc0000', fontWeight: 'bold', fontSize: '12px' }}>
              NO PROFILES FOUND MATCHING YOUR CURRENT CONFIGURATION PARAMETERS.
            </div>
          ) : (
            <div style={styles.resultsGrid}>
              {filteredProfiles.map((prof) => (
                <div key={prof.User_id} style={styles.userCard}>
                  <div>
                    {/* Link paths point explicitly to independent profile parameters rows keys */}
                    <Link to={`/profile/${prof.User_id}`} style={styles.usernameLink}>
                      {prof.username || 'Anonymous User'}
                    </Link>
                    <Link to={`/profile/${prof.User_id}`}>
                      <img 
                        src={prof.avatar_url || 'https://placehold.co'} 
                        alt="avatar" 
                        style={styles.avatar} 
                      />
                    </Link>
                  </div>
                  
                  <div style={{ width: '100%', borderTop: '1px dotted #ccc', paddingTop: '6px' }}>
                    <p style={styles.statusText}>
                      {prof.status_message ? `"${prof.status_message}"` : '"Retro vibes..."'}
                    </p>
                    <p style={styles.infoLabel}>Hometown: <b>{prof.hometown || 'Unknown'}</b></p>
                    <p style={styles.infoLabel}>Status: <span style={{ color: prof.status === 'online' ? 'green' : '#666', fontWeight: 'bold' }}>{prof.status || 'offline'}</span></p>
                    
                    <div style={{ marginTop: '10px' }}>
                      <Link to={`/profile/${prof.User_id}`}>
                        <button style={{ ...styles.button, width: '100%', padding: '4px' }}>View Space »</button>
                      </Link>
                    </div>
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
