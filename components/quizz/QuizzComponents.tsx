import { KapootLeafComponent } from "@common/quizz_components/_base";
import { BinaryAnswerComponent, BinaryQuestionComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { FC } from "react";

import styles from "./QuizzComponents.module.scss";

type ReactQuizzComponent<T extends KapootLeafComponent<any>> = FC<{ component: T, editor: boolean }>;

/**
 * Answer Components
 */
export const BinaryAnswer: ReactQuizzComponent<BinaryAnswerComponent> = ({ component, editor }) => {
    return <p>{component.get('label')}</p>;
};

export const SimpleAnswer: ReactQuizzComponent<SimpleAnswerComponent> = ({ component, editor }) => {
    return <p className={styles.test}>{component.get('label')}</p>;
}


/**
 * Question Components
 */
export const BinaryQuestion: ReactQuizzComponent<BinaryQuestionComponent> = ({ component, editor }) => {
    return (<div>
        <p>{component.children[0].get('label')}</p>
        <p>{component.children[1].get('label')}</p>
    </div>);
};

export const SimpleQuestion: ReactQuizzComponent<SimpleQuestionComponent> = ({ component, editor }) => {
    return (<div>
        {component.children.map((ans, i) => <p key={i} className={styles.test}>{ans.get('label') + (editor ? " [EDITOR] " : "")}</p>)}
    </div>)
};
