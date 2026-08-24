import { Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <Truck size={20} />
        </div>
        <span
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Delivery
        </span>
      </div>

      <Outlet />
    </div>
  );
}
