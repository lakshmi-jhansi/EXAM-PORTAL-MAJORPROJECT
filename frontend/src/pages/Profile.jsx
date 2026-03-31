import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, logout, checkAuth } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  if (!user) return null;

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    setUploading(true);
    try {
      await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Refresh user to get new profile picture
      if (checkAuth) await checkAuth();
      else window.location.reload();
    } catch (err) {
      alert("Failed to upload image: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    } finally {
      setUploading(false);
    }
  };

  const pictureSrc = user?.profile_picture ? `${user.profile_picture}`.replace('http://127.0.0.1:8000', 'http://localhost:8000') : null;

  return (
    <main className="page-container animate-fade">
      <div className="page-header">
        <h1>Your Profile</h1>
        <p className="subtitle">Manage your account and settings</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: '1 1 300px', textAlign: 'center', padding: '40px' }}>
          <div 
            onClick={handleImageClick}
            style={{ 
              width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '32px', fontWeight: 'bold', margin: '0 auto 20px auto',
              overflow: 'hidden', cursor: 'pointer', position: 'relative',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)', border: '2px solid var(--accent)'
            }}
            title="Click to upload new picture"
          >
            {pictureSrc ? (
              <img src={pictureSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '14px' }}>Loading...</div>}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/webp" 
            style={{ display: 'none' }} 
          />
          <h2 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{user.full_name || 'No Name'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{user.email}</p>
          <span className="badge badge-medium" style={{ fontSize: '14px' }}>Student Account</span>
        </div>
        
        <div className="stat-card" style={{ flex: '2 1 400px', padding: '40px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Account Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px 20px', fontSize: '15px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Name</div>
            <div style={{ color: 'var(--text-secondary)' }}>{user.full_name || '-'}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Email</div>
            <div style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Role</div>
            <div style={{ color: 'var(--text-secondary)' }}>Student</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Status</div>
            <div style={{ color: '#10b981', fontWeight: 500 }}>Active</div>
          </div>
          
          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Danger Zone</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={logout} style={{ flex: 1 }}>Sign Out</button>
              <button className="btn btn-danger" onClick={async () => {
                if (!window.confirm("Are you sure you want to deactivate your active account? You will be immediately logged out and permanently lose access unless an Admin restores you.")) return;
                try {
                  await import('../api/axios').then(module => module.default.delete('/auth/profile/'));
                  logout();
                } catch (err) {
                  alert("Failed to deactivate account: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
                }
              }} style={{ flex: 1 }}>Deactivate Account</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
