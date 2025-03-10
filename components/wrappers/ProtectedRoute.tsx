import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import Loading from '../Loading';


const ProtectedRouteWrapper = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => { 
        if(!loading && !user) router.push('/login');
    }, [ user, loading, router ]);

    if (loading || !user) return <Loading />;
    return <>{children}</>;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    /**
     * Wrap pages with this component if authentication is required
     * User object can then be accessed with ``const { user } = useAuth();``
     * 
     * WARNING: This component NEEDS to be instantiated BEFORE calling useAuth(), or the context will be linked to static default values.
     */
    return (
    <AuthProvider>
        <ProtectedRouteWrapper>
            { children }
        </ProtectedRouteWrapper>
    </AuthProvider>
    )
};
