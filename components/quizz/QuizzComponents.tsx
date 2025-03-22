import { KapootLeafComponent } from "@common/quizz_components/_base";
import { BinaryAnswerComponent, BinaryQuestionComponent, QuestionComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { FC } from "react";

import styles from "./QuizzComponents.module.scss";
import { BaseProps, SimpleAnswerProps, SimpleQuestionProps } from "@common/quizz_components/_types";

type ReactQuizzComponent<T extends KapootLeafComponent<any>> = FC<React.HTMLAttributes<HTMLDivElement> & { component: T, editor: boolean, hook: (e: any) => void }>;

/**
 * Answer Components
 */
export const BinaryAnswer: ReactQuizzComponent<BinaryAnswerComponent> = ({ component, editor, hook }) => {
    return <p>{component.get('label')}</p>;
};

export const SimpleAnswer: ReactQuizzComponent<SimpleAnswerComponent> = ({ component, editor, hook }) => {
    const onChange = (prop: keyof SimpleAnswerProps, value: any) => { component.set(prop, value); hook(null); };
    const inlineStyles = { "--color": component.get('background') } as React.CSSProperties;
    
    return (
        <div className={styles.simpleAnswer} style={inlineStyles}>
            {
                editor ?
                <input className={styles.answerLabel} type="text" value={component.get('label')} onChange={(e) => onChange('label', e.target.value)}/> :
                <p className={styles.answerLabel}>{component.get('label')}</p>
            }
        </div>
    );
}


export const BinaryQuestion: ReactQuizzComponent<BinaryQuestionComponent> = ({ component, editor, hook }) => {
    return (<div>
        <p>{component.children[0].get('label')}</p>
        <p>{component.children[1].get('label')}</p>
    </div>);
};

export const SimpleQuestion: ReactQuizzComponent<SimpleQuestionComponent> = ({ component, editor, hook }) => {
    const onChange = (prop: keyof SimpleQuestionProps, value: any) => { component.set(prop, value); hook(null); };
    return (
        <>
            <div className={styles.questionHeader}>
                { editor ?
                    <input className={styles.questionTitle} value={component.get('label')} onChange={(e) => onChange('label', e.target.value)} /> :
                    <h1 className={styles.questionTitle}>{component.get('label')}</h1>
                }
                { editor ?
                    <input className={styles.questionDesc} value={component.get('description')} onChange={(e) => onChange('description', e.target.value)}></input> :
                    <h1 className={styles.questionDesc}>{component.get('description')}</h1>
                }
            </div>
            {
                component.get('thumbnail') && <img src={component.get('thumbnail')} alt='Question Image' />
            }
            <div className={styles.questionAnswers}>
                { component.children.map((ans, i) => <SimpleAnswer key={i} component={ans} editor={editor} hook={hook} />) }
            </div>
        </>
    );
};
