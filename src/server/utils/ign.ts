import igns from "./ign.json";

function getRandom<T>(arr: T[]): T 
{
    return arr[Math.floor(Math.random() * arr.length)];
}
  
export function randomIGN(): string
{
    const format = getRandom(igns.formats);
    const adjective = getRandom(igns.adjectives);
    const noun = getRandom(igns.nouns);

    return format.replace("%", `${adjective}${noun}`);
}