import { passwordRegex } from '../src/common/sanitizers';
import React, { FormEvent, useState } from 'react';
import styles from './LoginForm.module.scss';

const LoginForm = () => {
    // TODO : Accept some redirection parameter to redirect the user once logged in
    // TODO : Redirect to the page if the user is already logged in

    const [ formData, setFormData ] = useState({
        login: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // TODO : Apply styles according to whether inputs are valid or not
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
                    alert('Logged in');
                } else {
                    res.json().then((cnt) => alert(JSON.stringify(cnt)));
                }
            }
        )
    }


    return (
        <div>
            <h1>Login page</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor='login'>Username or Email</label>
                <input name='login' id='login' type='text' onChange={handleChange} required /> <br />

                <label htmlFor='password'>Password</label>
                <input name='password' id='password' type='password' pattern={passwordRegex.source} onChange={handleChange} required /> <br />

                <button type='submit'>Log in</button>
            </form>
        </div>
    );
};

export default LoginForm;