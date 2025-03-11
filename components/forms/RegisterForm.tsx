import { usernameRegex, emailRegex, passwordRegex } from '@common/sanitizers';
import React, { FormEvent, useState } from 'react';

import styles from './LoginForm.module.scss';

const RegisterForm = () => {
    // TODO : Accept some redirection parameter to redirect the user once logged in
    // TODO : Redirect to the page if the user is already logged in

    const [ formData, setFormData ] = useState({
        username: "",
        mail: "",
        password: "",
        passwordVerif: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // TODO : Apply styles according to whether inputs are valid or not
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        fetch('/api/account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: formData.username, mail: formData.mail, password: formData.password })
        }).then(
            (res) => {
                if(res.status === 200) {
                    alert('Account created');
                } else {
                    res.json().then((cnt) => alert(JSON.stringify(cnt)));
                }
            }
        )
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Create an account</h1>

                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.inputContainer}>
                        <label htmlFor='username'>Username</label>
                        <input name='username' id='username' type='text' pattern={usernameRegex.source} onChange={handleChange} required /> <br />

                        <label htmlFor='mail'>Email Address</label>
                        <input name='mail' id='mail' type='text' pattern={emailRegex.source} onChange={handleChange} required /> <br />

                        <label htmlFor='password'>Password</label>
                        <input name='password' id='password' type='password' pattern={passwordRegex.source} onChange={handleChange} required /> <br />

                        <label htmlFor='passwordVerif'>Retype your password</label>
                        <input name='passwordVerif' id='passwordVerif' type='password' pattern={passwordRegex.source} onChange={handleChange} required /> <br />
                    </div>
                    <button className={styles.sign} type='submit'>Register</button>
                </form>

                <div className={styles.line} />
                <p className={styles.signup}>Already have an account? <a rel='noopener noreferrer' href='login?page=login'>Log in</a></p>
            </div>
        </div>
    );
};

export default RegisterForm;