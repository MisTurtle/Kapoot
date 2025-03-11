import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { useEffect } from 'react';
import Loading from '@components/misc/Loading';


const UnprotectedRouteWrapper = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => { 
        if(!loading && user) router.push('/');
    }, [ user, loading, router ]);
    
    if (loading && user) return <Loading />;
    return <>{children}</>;
};

export const UnprotectedRoute = ({ children }: { children: React.ReactNode }) => {
    /**
     * Wrap pages with this component if the user CANNOT be logged in.
     * 
     * WARNING: This component NEEDS to be instantiated BEFORE calling useAuth(), or the context will be linked to static default values.
     */
    return (
        <AuthProvider>
            <UnprotectedRouteWrapper>
                { children }
            </UnprotectedRouteWrapper>
        </AuthProvider>
    );
};
