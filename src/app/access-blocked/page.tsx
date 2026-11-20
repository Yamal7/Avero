import { logout } from '@/app/(dashboard)/dashboard/actions';
export default function Blocked() { return <main className="auth card"><h1>Dostęp został zablokowany</h1><p>Skontaktuj się z administratorem firmy, aby wyjaśnić dostęp do programu.</p><form action={logout}><button>Wyloguj</button></form></main>; }
