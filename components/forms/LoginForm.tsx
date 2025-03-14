import { FormInputChecker, passwordChecker, passwordRegex } from '@common/sanitizers';
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/router'; 
import styles from './LoginForm.module.scss';
import { AlertCircle } from 'lucide-react';

const LoginForm = () => {
    // TODO : Accept some redirection parameter to redirect the user once logged in
    // TODO : Redirect to the page if the user is already logged in
    const router = useRouter();
    const [ formData, setFormData ] = useState({ login: "", password: "" });
    const [ errors, setErrors ] = useState<Record<string, string>>({});
    const checkers: Record<string, FormInputChecker> = { 'password': passwordChecker };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const inputName = e.target.name;
        const inputValue = e.target.value;
        const checker = checkers[inputName];
        let updatedErrors = { ...errors };
        
        if(checker !== undefined)
        {
            const error = checker(inputValue);
            if(!error.valid && error.message) updatedErrors[inputName] = error.message;  // Add an error
            else if(error.valid) delete updatedErrors[inputName];  // Remove an error
        }

        setErrors(updatedErrors);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        fetch('/api/account/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: formData.login, password: formData.password })
        }).then(
            (res) => {
                if(res.status === 200) {
                    router.push('/');
                } else {
                    // TODO : Make this prettier, an actual error message
                    res.json().then((cnt) => alert(JSON.stringify(cnt)));
                }
            }
        )
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
                        <br />

                        <label htmlFor="password">Password</label>
                        <input name='password' id='password' type='password' onChange={handleChange} required />
                        { errors.password && <p className={styles.errorMessage}><AlertCircle height={16}/> {errors.password}</p> }
                    </div>
                    <button className={styles.sign} type='submit'>Sign in</button>
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