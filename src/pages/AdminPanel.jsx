import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import NavBar from '../components/NavBar';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .admin-wrapper { background-color: #0b0c10; min-height: 100vh; color: #c5c6c7; font-family: 'Courier New', monospace; padding-bottom: 40px; }
    .admin-container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
    .admin-title { color: #FF6600; font-size: 28px; font-weight: bold; margin-bottom: 24px; border-bottom: 2px solid #FF6600; padding-bottom: 10px; text-transform: uppercase; }
    
    /* 📈 ANALYTICS CARDS GRID */
    .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .analytics-card { background-color: #1f2833; border: 2px solid #FF6600; border-radius: 4px; padding: 20px; box-shadow: 4px 4px 0px #ffffff; text-align: center; }
    .analytics-num { font-size: 32px; font-weight: bold; color: #fff; margin-top: 8px; }
    
    .panel-box { background-color: #111112; border: 2px solid #FF6600; border-radius: 4px; padding: 20px; margin-bottom: 24px; box-shadow: 4px 4px 0px #ffffff; }
    .panel-header { font-size: 18px; font-weight: bold; color: #ffffff; margin-bottom: 16px; border-bottom: 1px solid #333; padding-bottom: 6px; text-transform: uppercase; }
    
    /* Tables Styling */
    .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    .admin-table th { background-color: #FF6600; color: #000000; padding: 10px; font-weight: bold; }
    .admin-table td { padding: 10px; border-bottom: 1px solid #222; color: #fff; }
    
    .btn-ban { background-color: #FF6600; color: #000; border: 1px solid #000; font-weight: bold; padding: 4px 10px; cursor: pointer; border-radius: 3px; font-family: inherit; }
    .btn-unban { background-color: #4BAC4E; color: #fff; border: 1px solid #000; font-weight: bold; padding: 4px 10px; cursor: pointer; border-radius: 3px; font-family: inherit; }
    .btn-delete { background-color: #E41E3F; color: #fff; border: 1px solid #000; font-weight: bold; padding: 4px 10px; cursor: pointer; border-radius: 3px; font-family: inherit; margin-left: 6px; }
    
    .unauthorized-lock { text-align: center; color: #E41E3F; font-size: 20px; font-weight: bold; padding: 100px 20px; background-color: #0b0c10; min-height: 100vh; font-family: 'Courier New', monospace; }
  `;
  document.head.appendChild(styleEl);
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  /* Metrics State Arrays */
  const [metrics, setMetrics] = useState({ totalMembers: 0, onlineMembers: 0, totalComplaints: 0, totalViews: 0 });
  const [membersList, setMembersList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);

  // 🛡️ Security Check Gateway: Confirm logged-in session has Admin permissions flags
  useEffect(() => {
    if (!user) { setCheckingAdmin(false); return; }
    
    const verifyAdminStatus = async () => {
      const { data } = await supabase.from('profiles').select('is_admin').eq('User_id', user.id).single();
      if (data?.is_admin) {
        setIsAdmin(true);
        loadAdminDashboardData();
      }
      setCheckingAdmin(false);
    };
    verifyAdminStatus();
  }, [user]);

  const loadAdminDashboardData = async () => {
    try {
      // 1. Fetch Global Core Analytics Metrics
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: onlineUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'online');
      const { count: complaintsCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
      const { count: totalProfileViews } = await supabase.from('profile_views').select('*', { count: 'exact', head: true });

      setMetrics({
        totalMembers: totalUsers || 0,
        onlineMembers: onlineUsers || 0,
        totalComplaints: complaintsCount || 0,
        totalViews: totalProfileViews || 0
      });

      // 2. Load Platform Members Ledger Rows
      const { data: members } = await supabase.from('profiles').select('User_id, username, status, is_banned, last_seen').order('username', { ascending: true });
      setMembersList(members || []);

      // 3. Load Active Complaints Reports
      const { data: reports } = await supabase
        .from('complaints')
        .select('id, complaint_text, created_at, status, offender:profiles!complaints_offender_id_fkey(username)')
        .order('created_at', { ascending: false });
      setComplaintsList(reports || []);

    } catch (err) { console.error('Dashboard aggregation crash:', err); }
  };

    /* 🚫 ACTION: TOGGLE MEMBER BAN STATUS */
  const handleToggleBan = async (userId, currentBanStatus) => {
    const actionWord = currentBanStatus ? 'Unban' : 'Ban';
    if (!window.confirm(`Are you sure you want to ${actionWord} this member?`)) return;

    const { error } = await supabase.from('profiles').update({ is_banned: !currentBanStatus }).eq('User_id', userId);
    if (!error) loadAdminDashboardData();
  };

  /* 💀 ACTION: PERMANENT USER PURGE (DELETES AUTH & PUBLIC SCHEMA DATA) */
  const handlePurgeMember = async (userId, username) => {
    if (!window.confirm(`⚠️ CRITICAL WARNING: Permanently delete ${username}'s entire account? This completely wipes their public profile text, tracks, and friends connections data. This cannot be undone.`)) return;

    // Direct deletion query hitting your secure cascade system tables configurations
    const { error } = await supabase.from('profiles').delete().eq('User_id', userId);
    if (!error) {
      alert(`Account associated with user [${username}] has been fully purged.`);
      loadAdminDashboardData();
    }
  };

  if (checkingAdmin) return <div className="admin-wrapper" style={{ padding: '40px', textAlign: 'center' }}>VALIDATING SECURITY PROFILE KEY...</div>;
  if (!isAdmin) return <div className="admin-wrapper unauthorized-lock">⚠️ ACCESS DENIED: Administrative security clearance credentials required.</div>;

    return (
    <div className="admin-wrapper">
      <NavBar />
      
      <div className="admin-container">
        <h1 className="admin-title">Admin Command Center</h1>

        {/* 📈 REAL-TIME DATA ANALYTICS GRID CONTAINER */}
        <div className="analytics-grid">
          <div className="analytics-card"><div style={{ color: '#45f3ff', fontWeight: 'bold' }}>TOTAL REGISTERED MEMBERS</div><div className="analytics-num">{metrics.totalMembers}</div></div>
          <div className="analytics-card"><div style={{ color: '#4bac4e', fontWeight: 'bold' }}>LIVE ONLINE CURRENTLY</div><div className="analytics-num">{metrics.onlineMembers}</div></div>
          <div className="analytics-card"><div style={{ color: '#E41E3F', fontWeight: 'bold' }}>PENDING DISPUTE COMPLAINTS</div><div className="analytics-num">{metrics.totalComplaints}</div></div>
          <div className="analytics-card"><div style={{ color: '#FF6600', fontWeight: 'bold' }}>TOTAL NETWORK FOOTPRINT VIEWS</div><div className="analytics-num">{metrics.totalViews}</div></div>
        </div>

        {/* 📌 SYSTEM COMPLAINTS REPORTS LEDGER CARD */}
        <div className="panel-box">
          <div className="panel-header">🚨 Member Incident Reports Box</div>
          {complaintsList.length === 0 ? (
            <div style={{ color: '#666', fontSize: '13px' }}>Clear schedule: Zero pending member reports logged.</div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Date Logged</th><th>Target Offender</th><th>Complaint Details Description</th><th>Status</th></tr></thead>
              <tbody>
                {complaintsList.map(report => (
                  <tr key={report.id}>
                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                    <td style={{ color: '#FF6600', fontWeight: 'bold' }}>{report.offender?.username || 'Unknown Profile'}</td>
                    <td>{report.complaint_text}</td>
                    <td><span style={{ color: report.status === 'pending' ? '#ef4444' : '#4bac4e' }}>{report.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 👥 GLOBAL USER PRIVILEGES MANAGEMENT MATRIX */}
        <div className="panel-box">
          <div className="panel-header">👥 Platform Membership Management Directory</div>
          <table className="admin-table">
            <thead><tr><th>Username Display</th><th>User UUID Key</th><th>Network Presence</th><th>Last Activity Connection</th><th>Administrative Actions</th></tr></thead>
            <tbody>
              {membersList.map(member => (
                <tr key={member.User_id}>
                  <td style={{ fontWeight: 'bold' }}>{member.username} {member.is_banned && <span style={{ color: '#ef4444', fontSize: '10px' }}>[BANNED]</span>}</td>
                  <td style={{ fontFamily: 'monospace', color: '#888' }}>{member.User_id}</td>
                  <td>{member.status === 'online' ? <span style={{ color: '#4bac4e' }}>● online</span> : <span style={{ color: '#666' }}>○ offline</span>}</td>
                  <td>{new Date(member.last_seen).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleToggleBan(member.User_id, member.is_banned)} className={member.is_banned ? "btn-unban" : "btn-ban"}>
                      {member.is_banned ? 'Unban Member' : 'Ban Member'}
                    </button>
                    <button onClick={() => handlePurgeMember(member.User_id, member.username)} className="btn-delete">
                      Purge Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
