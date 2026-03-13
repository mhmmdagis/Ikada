import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function ProfileRedirect() {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
        redirect('/login');
    }
    redirect(`/profile/${session.userId}`);
}
