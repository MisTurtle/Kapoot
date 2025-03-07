import React from 'react';
import { useRouter } from 'next/router';
import { UnprotectedRoute } from '../components/wrappers/UnprotectedRoute';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { NavBarAuto } from '../components/NavBar';


const LoginContent = () => {
    const router = useRouter();
    const { page } = router.query;  // Fetch the `page` GET parameter
    
    // TODO : Tab view to switch between register and login, to remove on button
    return (
        <div>
            <NavBarAuto />
            { page === 'register' ? <RegisterForm /> : <LoginForm /> }
        </div>
    );
};

const LoginPage = () => {
    return (
        <UnprotectedRoute>
            <LoginContent />
        </UnprotectedRoute>
    );
};

export default LoginPage;
