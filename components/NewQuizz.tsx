
import { NavBarSignedIn, NavBarSignedOut } from './NavBar';
import { usernameRegex, emailRegex, passwordRegex } from '../src/common/sanitizers';

import React, { FormEvent, useState, useEffect } from 'react';

const NewQuizz = () => {
    // TODO : Turn this into a utility to reduce boilerplate
    const [user, setUser] = useState<UserIdentifier | undefined>(undefined);
    useEffect(() => {
      // Fetch auth status from the express API
      fetch('/api/account')
        .then((res) => {
          if(res.status !== 200) return undefined;
          return res.json();
        })
        .then(data => setUser(data))
        .catch(() => setUser(undefined));
    }, []);


    // TODO : Change following formData according quizz parameters

    const [ formData, setFormData ] = useState({
        name: "",
        questions: [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // TODO : Apply styles according to whether inputs are valid or not
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        fetch('/api/editor/createQuizz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formData.name, questions: formData.questions })
        }).then(
            (res) => {
                if(res.status === 200) {
                    alert('Quizz created');
                } else {
                    res.json().then((cnt) => alert(JSON.stringify(cnt)));
                }
            }
        )
    }


    return (
        <div>
            { user ? <NavBarSignedIn /> : <NavBarSignedOut /> }

            <div>
                <h1>Quizz creation page</h1>

                <form onSubmit={handleSubmit}>
                    <label htmlFor='name'>Quizz name</label>
                    <input name='name' id='name' type='text' onChange={handleChange} required /> <br />

                    <label htmlFor='question'>Question 1</label>
                    <input name='question' id='question' pattern={passwordRegex.source} onChange={handleChange} required /> <br />

                    <button type='submit'>Create quizz</button>
                </form>
            </div>
        </div>
    );
};

export default NewQuizz;