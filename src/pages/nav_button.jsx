import { useNavigate } from 'react-router';

export default function CloseButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        lineHeight: 1,
        padding: 0,
        fontSize: "45px",
        color: "white",
        marginBottom: "10px",
      }}
      aria-label="Close navigation"
    >
      ×
    </button>
  );
}
