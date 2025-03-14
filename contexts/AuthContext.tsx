import { handle } from "@common/responses";
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
            
            return await handle<UserIdentifier>(
                response,
                (user) => { setUser(user); return true; },
                () => { setUser(undefined); return false; }
            );
        } catch(err) {
            setUser(undefined);
            return false;
        } finally {
            setLoading(false);
        }
    }
    
    // Schedule user account retrieval by fetching to the server.
    useEffect(() => { checkAuthenticated(); }, [ router ]);

    return <AuthContext.Provider value={{ user, loading, setUser }}> {children} </AuthContext.Provider>;
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within a AuthProvider (ProtectedRoute or UnprotectedRoute)");
    return context;
};
