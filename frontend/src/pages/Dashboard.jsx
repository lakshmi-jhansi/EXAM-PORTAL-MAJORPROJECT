import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const NAV_CARDS = [
  {
    to: '/exam/setup',
    icon: '📝',
    title: 'Start an Exam',
    desc: 'Select topics, set a time limit, and begin your AI-powered exam session.',
    color: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.20))',
    border: 'rgba(99,102,241,0.4)',
  },
  {
    to: '/exam/setup',
    icon: '📚',
    title: 'Browse Topics',
    desc: 'Explore 12+ subject areas from Algorithms to Cloud Computing.',
    color: 'linear-gradient(135deg, rgba(16,185,129,0.20), rgba(5,150,105,0.15))',
    border: 'rgba(16,185,129,0.35)',
  },
  {
    to: '/history',
    icon: '📊',
    title: 'My History',
    desc: 'Review your past exam sessions, scores, and performance trends.',
    color: 'linear-gradient(135deg, rgba(245,158,11,0.20), rgba(217,119,6,0.15))',
    border: 'rgba(245,158,11,0.35)',
  },
  {
    to: '/profile',
    icon: '⚙️',
    title: 'Settings',
    desc: 'Manage your profile, preferences, and notification settings.',
    color: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.12))',
    border: 'rgba(239,68,68,0.3)',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ examsTaken: '-', avgScore: '-', streak: '-' });

  useEffect(() => {
    api.get('exams/sessions/history/')
      .then((res) => {
        const history = res.data || [];
        const completed = history.filter(h => h.status === 'completed' && !h.is_locked_out);
        
        const examsTaken = completed.length;
        const avgScore = examsTaken > 0 
          ? (completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / examsTaken).toFixed(1)
          : 0;

        // Simple Streak calculation based strictly on UTC calendar days
        const days = [...new Set(completed.map(h => new Date(h.started_at).toDateString()))]
                      .sort((a, b) => new Date(b) - new Date(a));
        
        let streak = 0;
        let today = new Date();
        today.setHours(0,0,0,0);
        
        for (let i = 0; i < days.length; i++) {
          let testDate = new Date(days[i]);
          let diffDays = Math.round((today - testDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === streak || diffDays === streak + 1) {
             if (diffDays === streak + 1) streak++;
             if (diffDays === 0 && streak === 0) streak = 1;
          } else if (diffDays > 1 && streak === 0) {
              break; // Unbroken streak is over before it started
          } else {
             break;
          }
        }
        
        setStats({ examsTaken, avgScore: avgScore + '%', streak });
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';



  return (
    <>
      <main className="page-container animate-fade">
        <div className="page-header">
          <h1>Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="subtitle">What would you like to do today?</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Exams Taken</div>
            <div className="stat-value">{stats.examsTaken}</div>
            <div className="stat-sub">Completed runs</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Score</div>
            <div className="stat-value">{stats.avgScore}</div>
            <div className="stat-sub">Valid submissions</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Topics Covered</div>
            <div className="stat-value">12</div>
            <div className="stat-sub">Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Streak</div>
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-sub">Days in a row</div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="section-title">Quick Actions</div>
        <div className="dashboard-grid">
          {NAV_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="dash-card"
              style={{ '--card-gradient': card.color, '--card-border': card.border }}
            >
              <div
                className="dash-card-icon"
                style={{ background: card.color, border: `1px solid ${card.border}` }}
              >
                {card.icon}
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
              <span className="card-arrow">→</span>
            </Link>
          ))}
        </div>


      </main>
    </>
  );
}
