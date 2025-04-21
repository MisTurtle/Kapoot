import { FormInputChecker, WholeFormChecker } from "@common/sanitizers";

/**
 * Called when an input in a form changes, to display errors and update states
 */
export function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    checkers: Record<string, FormInputChecker>,
    formData: Record<string, string>,
    setFormData: React.Dispatch<React.SetStateAction<any>>,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    constraints: WholeFormChecker[] = []
) {
    const inputName = e.target.name;
    const inputValue = e.target.value;
    let valid = true;

    // Check if the whole form is complete
    const newFormData = { ...formData, [inputName]: inputValue };
    // Create a list of errors to apply to inputs
    let updatedErrors = Object.keys(checkers).reduce((prev: Record<string, string>, curr) => {
        const checker = checkers[curr];
        if(checker === undefined || !newFormData[curr]) return prev;
        const result = checker(newFormData[curr]);
        if(!result.valid && result.message) prev[curr] = result.message;
        return prev;
    }, {});
    // Apply form-wide constraints
    constraints.forEach(checker => {
        const result = checker(newFormData);
        if(!result.valid) {
            valid = false;
            if(result.field && result.message) updatedErrors[result.field] = result.message;
        }
    });

    valid &&= Object.keys(updatedErrors).length === 0;
    setErrors(updatedErrors);
    setFormData(newFormData);
    setEnabled(valid);
}

export const emoteChars = ['🐎', '🐐', '🐢', '🍀', '❤️', '👏', '🍆'];

export function getEmoteIcon(emote: Emote) : React.ReactNode 
{
    return emoteChars[emote] ?? emoteChars[0];
}
