import { token } from '../constant/theme';

export function LoadMoreBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center',
        border: `1px dashed ${token.border2}`, borderRadius: 8, color: token.muted,
        background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
        marginTop: 14, transition: 'all .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = token.accent;
        e.currentTarget.style.color = token.accent; e.currentTarget.style.background = token.accentPale; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = token.border2;
        e.currentTarget.style.color = token.muted; e.currentTarget.style.background = 'none'; }}
    >
      Load more ↓
    </button>
  );
}