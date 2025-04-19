import { KapootLeafComponent } from "@common/quizz_components/base";
import { BinaryAnswerComponent, BinaryQuestionComponent, QuestionComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { BinaryAnswer, BinaryQuestion, SimpleAnswer, SimpleQuestion } from "@components/quizz/QuizzComponents";
import { Dispatch, SetStateAction } from "react";


export const renderMap = {
    [BinaryAnswerComponent.type]: BinaryAnswer,
    [SimpleAnswerComponent.type]: SimpleAnswer,

    [BinaryQuestionComponent.type]: BinaryQuestion,
    [SimpleQuestionComponent.type]: SimpleQuestion
};

/**
 * 
 * @param component Server side component to render
 * @param editor Is it being rendered in the editor (If so, it will render inputs instead of static paragraphs)
 * @param hook Hook to call on user action (change in editor, pick in quizz session)
 * @returns A render node
 */
export function renderInEditor(component: KapootLeafComponent<any>, editor: boolean, hook: (e: any) => void, validAnswer: number, setValidAnswer: Dispatch<SetStateAction<number>>): React.ReactNode
{
    const Component = renderMap[component.type];
    if(!Component) return <p>Error: No rendering found for type `{component.type}`</p>;

    return <Component component={component as any} editor={editor} hook={hook} validAnswer={validAnswer} setValidAnswer={setValidAnswer} answerHook={undefined}/>;  // We need to tell typescript to trust us for once that the passed type is correct
}

export function renderInGame(component: QuestionComponent<BaseQuestionProps>, submitAnswer: (answer: number) => void): React.ReactNode
{
    // This is hacky as hell and definitely not maintainable, but oh well we're outta time
    const Component = renderMap[component.type];
    if(!Component) return <p>Error: No rendering found for type `{component.type}`</p>;

    return <Component component={component as any} editor={false} hook={undefined} validAnswer={-1} setValidAnswer={() => {}} answerHook={submitAnswer}/>;  // We need to tell typescript to trust us for once that the passed type is correct
}
