import { usernameRegex, emailRegex, passwordRegex, FormInputChecker, usernameChecker, emailChecker, passwordChecker, valid, invalid, WholeFormChecker } from '@common/sanitizers';
import { handleFormChange } from '@client/utils';
import { AlertCircle } from 'lucide-react';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';

import styles from './LoginForm.module.scss';
import { handle } from '@common/responses';
import { usePopup } from '@contexts/PopupContext';

const RegisterForm = () => {
    const router = useRouter();
    const { showPopup } = usePopup();
    const [ formData, setFormData ] = useState({ username: "", mail: "", password: "", passwordVerif: "" });
    const [ errors, setErrors ] = useState<Record<string, string>>({});
    const [ enabled, setEnabled ] = useState(false);
    const checkers: Record<string, FormInputChecker> = { 'username': usernameChecker, 'mail': emailChecker, 'password': passwordChecker };

    const passwordVerifChecker: WholeFormChecker = (formData: any) => formData.passwordVerif === formData.password ? valid() : { ...invalid('Both passwords do not match.'), field: 'passwordVerif' };
    const requiredFieldChecker: WholeFormChecker = (formData: any) => Object.values(formData).some(val => !val) ? invalid('Required fields are missing') : valid();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        return handleFormChange(e, checkers, formData, setFormData, setErrors, setEnabled, [ passwordVerifChecker, requiredFieldChecker ]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        fetch('/api/account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: formData.username, mail: formData.mail, password: formData.password })
        }).then(async res => await handle(
            res,
            () => {
                showPopup('success', 'Account created !', 5.0);
                router.push('/');
            },
            (err) => {
                showPopup('error', err, 5.0);
            }
        ));
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Create an account</h1>

                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.inputContainer}>
                        <label htmlFor='username'>Username</label>
                        <input name='username' id='username' type='text' pattern={usernameRegex.source} onChange={handleChange} required />
                        { errors.username && <p className={styles.errorMessage}><AlertCircle height={16} /> {errors.username}</p>}

                        <label htmlFor='mail'>Email Address</label>
                        <input name='mail' id='mail' type='text' pattern={emailRegex.source} onChange={handleChange} required />
                        { errors.mail && <p className={styles.errorMessage}><AlertCircle height={16} /> {errors.mail}</p>}

                        <label htmlFor='password'>Password</label>
                        <input name='password' id='password' type='password' pattern={passwordRegex.source} onChange={handleChange} required />
                        { errors.password && <p className={styles.errorMessage}><AlertCircle height={16} /> {errors.password}</p>}

                        <label htmlFor='passwordVerif'>Retype your password</label>
                        <input name='passwordVerif' id='passwordVerif' type='password' pattern={passwordRegex.source} onChange={handleChange} required />
                        { errors.passwordVerif && <p className={styles.errorMessage}><AlertCircle height={16} /> {errors.passwordVerif}</p>}
                    </div>
                    <button className={styles.sign} type='submit' disabled={!enabled}>Register</button>
                </form>

                <div className={styles.line} />
                <p className={styles.signup}>Already have an account? <a rel='noopener noreferrer' href='login?page=login'>Log in</a></p>
            </div>
        </div>
    );
};

export default RegisterForm;