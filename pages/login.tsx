import React from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Page = () => {
    const router = useRouter();
    const { page } = router.query;  // Fetch the `page` GET parameter
    
    // TODO : Tab view to switch between register and login, to remove on button
    return page === 'register' ? <RegisterForm /> : <LoginForm />;
};

export default Page;
