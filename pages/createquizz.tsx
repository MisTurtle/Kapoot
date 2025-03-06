import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import NewQuizz from '../components/NewQuizz';

const Page = () =>  {

    // TODO : Turn this into a utility to reduce boilerplate
    const [user, setUser] = useState<UserIdentifier | undefined>(undefined);
    useEffect(() => {
      // Fetch auth status from the express API
      fetch('/api/account')
        .then((res) => {
          if(res.status !== 200) return undefined;
          return res.json();
        })
        .then((data) => { console.log(data); setUser(data) })
        .catch(() => setUser(undefined));
    }, []);

    return (
        <div className="">
          { user ? <NewQuizz /> : <LoginForm /> }
        </div>
      );
}


export default Page;