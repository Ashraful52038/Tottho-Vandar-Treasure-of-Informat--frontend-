export const token = {
  accent: '#2d6a4f',
  accentLight: '#d8f3dc',
  accentPale: '#f0faf3',
  border: '#e8e5df',
  border2: '#d4cfc5',
  bg: '#f5f4f0',
  surface: '#ffffff',
  surface2: '#faf9f7',
  text: '#1a1917',
  muted: '#7a7570',
};

export const btnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', border: '1px solid', fontFamily: 'inherit', transition: 'all .15s',
};
export const btnPrimary: React.CSSProperties = {
  ...btnBase, background: token.accent, color: '#fff', borderColor: token.accent,
};
export const btnOutline: React.CSSProperties = {
  ...btnBase, background: token.surface, color: token.text, borderColor: token.border2,
};
export const btnFollowing: React.CSSProperties = {
  ...btnBase, background: token.accentPale, color: token.accent, borderColor: token.accentLight,
};