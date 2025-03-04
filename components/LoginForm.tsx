import Form from 'next/form';
import { NavBarSignedOut } from '../components/NavBar';
import { usernameRegex, emailRegex, passwordRegex } from '../src/server/utils/sanitizers';

import styles from './LoginForm.module.scss';
import React, { FormEvent, useState } from 'react';

const LoginForm = () => {
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
        <div>
            <NavBarSignedOut />

            <div>
                <h1>Login page</h1>

                <form onSubmit={handleSubmit}>
                    <label htmlFor='username'>Username</label>
                    <input name='username' id='username' type='text' pattern={usernameRegex.source} onChange={handleChange} required /> <br />

                    <label htmlFor='mail'>Email Address</label>
                    <input name='mail' id='mail' type='text' pattern={emailRegex.source} onChange={handleChange} required /> <br />

                    <label htmlFor='password'>Password</label>
                    <input name='password' id='password' type='password' pattern={passwordRegex.source} onChange={handleChange} required /> <br />

                    <label htmlFor='passwordVerif'>Retype your password</label>
                    <input name='passwordVerif' id='passwordVerif' type='password' pattern={passwordRegex.source} onChange={handleChange} required /> <br />

                    <button type='submit'>Register</button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;