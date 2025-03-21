import { KapootLeafComponent } from "@common/quizz_components/_base";
import { BinaryAnswerComponent, BinaryQuestionComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { BinaryAnswer, BinaryQuestion, SimpleAnswer, SimpleQuestion } from "@components/quizz/QuizzComponents";


export const renderMap = {
    [BinaryAnswerComponent.type]: BinaryAnswer,
    [SimpleAnswerComponent.type]: SimpleAnswer,

    [BinaryQuestionComponent.type]: BinaryQuestion,
    [SimpleQuestionComponent.type]: SimpleQuestion
};

export function render(component: KapootLeafComponent<any>, editor: boolean): React.ReactNode
{
    const Component = renderMap[component.type];
    if(!Component) return <p>Error: No rendering found for type `{component.type}`</p>;

    return <Component component={component as any} editor={editor} />;  // We need to tell typescript to trust us for once that the passed type is correct
}
