import React from 'react';
import { useRouter } from 'next/router';
import { UnprotectedRoute } from '@components/wrappers/UnprotectedRoute';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import Loading from '@components/misc/Loading';
import { CustomNavBar } from '@components/NavBar';
import HeroPage from '@components/wrappers/HeroPage';

import styles from './login.module.scss';
import HeroLogo from '@components/misc/HeroLogo';


const LoginContent = () => {
    const { query, isReady } = useRouter();
    const { page } = query;  // Fetch the `page` GET parameter
    let content, navbar;

    if(!isReady) {
        content = <Loading />;
        navbar = <></>;
    } else {
        if(page === 'register') {
            content = <RegisterForm />;
            navbar = <CustomNavBar links={['home', 'signIn']} />
        }else{
            content = <LoginForm />;
            navbar = <CustomNavBar links={['home', 'signUp']} />
        }
    }
    
    return (
        <div>
            { navbar }
            { content }
        </div>
    );
};

const LoginPage = () => {
    return (
        <UnprotectedRoute>
            <HeroPage>
                <div className={styles.form}>
                    <HeroLogo />
                    <LoginContent />
                </div>
            </HeroPage>
        </UnprotectedRoute>
    );
};

export default LoginPage;
