import { useRouter } from "next/router";
import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
    user?: UserIdentifier;
    loading: boolean;
    setUser: (user?: UserIdentifier) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: undefined,
    loading: true,
    setUser: () => null
});

export const AuthProvider = ( { children } : { children: React.ReactNode } ) => {
    const [ user, setUser ] = useState<UserIdentifier | undefined>(undefined);
    const [ loading, setLoading ] = useState(true);
    const router = useRouter();

    const checkAuthenticated = async () => {
        try{
            const response = await fetch('/api/account');
            
            if(!response.ok) {
                setUser(undefined);
                return false;
            }

            const user = await response.json();
            setUser(user);
            return true;
        } catch(err) {
            setUser(undefined);
            return false;
        } finally {
            setLoading(false);
        }
    }
    
    // Schedule user account retrieval by fetching to the server.
    useEffect(() => { checkAuthenticated() }, [ router ]);

    return <AuthContext.Provider value={{ user, loading, setUser }}> {children} </AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);