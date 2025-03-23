import { KapootComponentContainer, KapootLeafComponent } from "@common/quizz_components/_base";
import { BinaryAnswerComponent, BinaryQuestionComponent, QuestionComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { FC, useState } from "react";
import { HuePicker, SliderPicker } from "react-color";

import { BaseProps, SimpleQuestionProps } from "@common/quizz_components/_types";
import { ArrowLeftCircle, PaintRollerIcon, ShapesIcon, Trash2Icon } from "lucide-react";
import DeleteButton from "@components/misc/Delete";
import { useContextMenu } from "@contexts/EditorContextMenus";

import styles from "./QuizzComponents.module.scss";
import ActionButton from "@components/misc/ActionButton";


type ReactQuizzComponent<T extends KapootLeafComponent<any>> = FC<React.HTMLAttributes<HTMLDivElement> & {
    parent?: KapootComponentContainer<any>,
    component: T,
    editor: boolean,
    hook: (e: any) => void
}>;

/**
 * Answer Components
 */
const BaseAnswer: ReactQuizzComponent<KapootLeafComponent<BaseProps>> = ({ parent, component, editor, hook, children }) => {
    const { openMenu, closeMenu } = useContextMenu();
    const onChange = (prop: keyof BaseProps, value: any) => { component.set(prop, value); hook(null); };
    const inlineStyles = { "--color": component.get('background') } as React.CSSProperties;

    const deleteSelf = () => {
        const index = parent?.children.indexOf(component);
        if(index !== undefined && index >= 0) parent?.children.splice(index, 1);
        hook(null);
        closeMenu();

    };
    const changeBackground = (newColor: number[]) => {
        component.set('background', newColor);
        hook(null);
    };

    const handleMainContextMenu = (e?: React.MouseEvent) => {
        if(e) e.preventDefault();
        openMenu(
            component,
            [
                <p><strong>{ component.get('label') }</strong></p>,
                <hr />,
                <ActionButton onClick={() => showBackgroundColorPicker()}><PaintRollerIcon /> Background</ActionButton>,
                <ActionButton onClick={() => {}}><ShapesIcon /> Icon</ActionButton>,
                <ActionButton theme="error" onClick={deleteSelf}><Trash2Icon /> Delete</ActionButton>
            ],
            e ? { x: e.clientX, y: e.clientY } : undefined
        );
    };
    const showBackgroundColorPicker = () => {
        setTimeout(() => openMenu(
            component,
            [
                <p><strong>{ component.get('label') }</strong></p>,
                <hr />,
                <HuePicker 
                    color={bgColor ? { r: bgColor[0], g: bgColor[1], b: bgColor[2] } : undefined}
                    onChange={(newColor) => changeBackground([ newColor.rgb.r, newColor.rgb.g, newColor.rgb.b ])}
                    onChangeComplete={(newColor) => changeBackground([ newColor.rgb.r, newColor.rgb.g, newColor.rgb.b ])}
                />,
                <ActionButton onClick={() => handleMainContextMenu()}><ArrowLeftCircle /> Back</ActionButton>
            ]
        ), 1);  // Timeout is required, otherwise the document trigger to close the context menu is called after rerendering, which hides the new context
    };
    let bgColor = component.get('background');

    return (
        <>
            <div 
                className={styles.answerBase} 
                style={inlineStyles}
                onContextMenu={e => editor && handleMainContextMenu(e)}
            >
                {editor && <DeleteButton className={styles.delete} callback={deleteSelf} />}
                {editor ? (
                    <input className={styles.answerLabel} type="text" value={component.get('label')} onChange={(e) => onChange('label', e.target.value)} />
                ) : (
                    <p className={styles.answerLabel}>{component.get('label')}</p>
                )}

                {children}
            </div>
        </>
    );
};

export const BinaryAnswer: ReactQuizzComponent<BinaryAnswerComponent> = ({ parent, component, editor, hook }) => {
    return <BaseAnswer parent={parent} component={component} editor={editor} hook={hook}></BaseAnswer>;
};

export const SimpleAnswer: ReactQuizzComponent<SimpleAnswerComponent> = ({ parent, component, editor, hook }) => {
    return <BaseAnswer parent={parent} component={component} editor={editor} hook={hook}></BaseAnswer>;
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
                    <input className={styles.questionDesc} value={component.get('description')} onChange={(e) => onChange('description', e.target.value)} placeholder="..."/> :
                    component.get('description') && <h2 className={styles.questionDesc}>{component.get('description')}</h2>
                }
            </div>
            {
                component.get('thumbnail') && <img src={component.get('thumbnail')} alt='Question Image' />
            }
            <div className={styles.questionAnswers}>
                { component.children.map((ans, i) => <SimpleAnswer key={i} parent={component} component={ans} editor={editor} hook={hook} />) }
            </div>
        </>
    );
};
