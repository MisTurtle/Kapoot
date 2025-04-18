import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/router'; 

export const Header = () => {

    const router = useRouter();
    
    const [ formData, setFormData ] = useState({
        type: "",
        text: "",
        answer: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // TODO : Apply styles according to whether inputs are valid or not
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        fetch('/api/editor/quizz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: formData.type, text: formData.text, answer: formData.answer })
        });
    }

    return (
        <form  onSubmit={handleSubmit}>
            <div >
                <label htmlFor="type">Type</label>
                <input name='type' id='type' type='text' onChange={handleChange} required /> <br />
                <label htmlFor="text">Question</label>
                <input name='text' id='text' onChange={handleChange} required /> <br />
                <label htmlFor="answer">Answer</label>
                <input name='answer' id='answer' onChange={handleChange} required />
            </div>
            <button type='submit'>Create quizz</button>
        </form>
        );
};

export default Header;