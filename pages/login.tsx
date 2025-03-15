import React from 'react';
import { useRouter } from 'next/router';
import { UnprotectedRoute } from '@components/wrappers/UnprotectedRoute';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import Loading from '@components/misc/Loading';
import { NavBarAuto } from '@components/NavBar';
import HeroPage from '@components/wrappers/HeroPage';


const LoginContent = () => {
    const { query, isReady } = useRouter();
    const { page } = query;  // Fetch the `page` GET parameter
    let content;

    if(!isReady) content = <Loading />;
    else content = page === 'register' ? <RegisterForm /> : <LoginForm />;
    
    return (
        <div>
            <NavBarAuto />
            { content }
        </div>
    );
};

const LoginPage = () => {
    return (
        <UnprotectedRoute>
            <HeroPage>
                <LoginContent />
            </HeroPage>
        </UnprotectedRoute>
    );
};

export default LoginPage;
