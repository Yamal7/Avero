import { logout } from '@/app/(dashboard)/dashboard/actions';
export default function NoAccess() { return <main className="auth card"><h1>Konto czeka na dostęp</h1><p>Otwórz otrzymany link zaproszenia albo poproś administratora o przypisanie konta do klienta lub zespołu firmy.</p><form action={logout}><button>Wyloguj</button></form></main>; }
