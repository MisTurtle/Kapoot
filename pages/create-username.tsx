
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { handle } from "@common/responses";
import { usePopup } from "@contexts/PopupContext";

const EnterUsername = () => {
    const router = useRouter();
    const { showPopup } = usePopup();
    const [code, setCode] = useState<string | undefined>(undefined);
    const [username, setUsername] = useState("");

    useEffect(() => {
        if (router.query.gamecode) {
            setCode(router.query.gamecode as string);
        }
    }, [router.query.gamecode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim() || !code) return;
    
        const res = await fetch(`/api/game/${code}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        }).then(async res => handle(
            res,
            (result) => {
                router.push('/game');
            },
            (error) => {
                showPopup('error', error, 5.0);
            }
        ));;
    };
  

    return (
    <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
      <h2>Enter your pseudonym before enter the game</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your pseudonym"
        required
      />
      <button type="submit">Rejoindre</button>
    </form>
  );
};

export default EnterUsername;
