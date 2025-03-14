import { FormInputChecker, invalid, loginChecker, passwordChecker, passwordRegex, valid, WholeFormChecker } from '@common/sanitizers';
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/router'; 
import styles from './LoginForm.module.scss';
import { AlertCircle } from 'lucide-react';
import { handleFormChange } from '@client/utils';
import { handle } from '@common/responses';
import { usePopup } from '@contexts/PopupContext';

const LoginForm = () => {
    // TODO : Accept some redirection parameter to redirect the user once logged in
    // TODO : Redirect to the page if the user is already logged in
    const router = useRouter();
    const { showPopup } = usePopup();
    const [ formData, setFormData ] = useState({ login: "", password: "" });
    const [ errors, setErrors ] = useState<Record<string, string>>({});
    const [ enabled, setEnabled ] = useState(false);
    const checkers: Record<string, FormInputChecker> = { 'login': loginChecker, 'password': passwordChecker };

    const requiredFieldChecker: WholeFormChecker = (formData: any) => Object.values(formData).some(val => !val) ? invalid('Required fields are missing') : valid();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        return handleFormChange(e, checkers, formData, setFormData, setErrors, setEnabled, [ requiredFieldChecker ]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        fetch('/api/account/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: formData.login, password: formData.password })
        }).then(async res => await handle(
            res, 
            () => {
                showPopup('success', 'Successfully logged in !', 5.0);
                router.push('/');
            }, 
            (err) => {
                showPopup('error', err, 5.0);
            }
        ));
    }


    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Sign in</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <label htmlFor="login">Username or Email</label>
                        <input name='login' id='login' type='text' onChange={handleChange} required />
                        { errors.login && <p className={styles.errorMessage}><AlertCircle height={16}/> {errors.login}</p> }
                        
                        <label htmlFor="password">Password</label>
                        <input name='password' id='password' type='password' onChange={handleChange} required />
                        { errors.password && <p className={styles.errorMessage}><AlertCircle height={16}/> {errors.password}</p> }
                    </div>
                    <button className={styles.sign} type='submit' disabled={!enabled}>Sign in</button>
                </form>
                <div className={styles.line} />
                <p className={styles.signup}>Don't have an account? 
                <a rel="noopener noreferrer" href="login?page=register">Register</a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;