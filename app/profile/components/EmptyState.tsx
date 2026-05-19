import { token } from '../constant/theme';

export function EmptyState({icon,text}:{icon:string, text:string}) {
    return (
        <div style={{textAlign: 'center', padding: '48px 24px', color: token.muted}}>
            <div style={{fontSize: 36, opacity: .35, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: 14 }}>{text}</div>
        </div>
    )
}