import { KapootComponentContainer, KapootLeafComponent } from "@common/quizz_components/base";
import { BinaryAnswerComponent, BinaryQuestionComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { RGBColor } from "react-color";

import { AlarmClockIcon, ArrowLeftCircle, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PaintRollerIcon, PlusCircleIcon, ShapesIcon, SquareCheckIcon, Trash2Icon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import DeleteButton from "@components/misc/Delete";
import { useContextMenu } from "@contexts/EditorContextMenus";

import styles from "./QuizzComponents.module.scss";
import ActionButton from "@components/misc/ActionButton";
import EditorColorPicker from "@components/misc/EditorColorPicker";
import { allIcons, getIcon } from "@common/constants";


type ReactQuizzComponent<T extends KapootLeafComponent<any>> = React.HTMLAttributes<HTMLDivElement> & {
    parent?: KapootComponentContainer<any>;
    component: T;
    editor: boolean;
    hook?: (e: any) => void;
};
type ReactAnswerComponent<T extends KapootLeafComponent<any>> = ReactQuizzComponent<T> & {
    isCorrect?: boolean;
    setCorrect?: (correct: any) => void;
};
type ReactQuestionComponent<T extends KapootLeafComponent<any>> = ReactQuizzComponent<T> & {
    validAnswer: number;  // TODO : | number[] for mcq
    setValidAnswer: Dispatch<SetStateAction<number>>;
    answerHook?: (answerId: number) => void;  // Called when the user clicks an answer in game
};

/**
 * Answer Components
 */
const AddAnswerButton = ({ callback }: { callback: () => void }) => {
    return (
        <button className={styles.answerAdd} onClick={callback}>
            <PlusCircleIcon /> Add Answer
        </button>
    );
};

const BaseAnswer: FC<ReactAnswerComponent<KapootLeafComponent<BaseProps>>> = ({ parent, component, editor, hook, children, isCorrect, setCorrect }) => {
    const { openMenu, closeMenu } = useContextMenu();
    const onChange = (prop: keyof BaseProps, value: any) => { component.set(prop, value); if(hook) hook(null); };
    const inlineStyles = { "--color": component.get('background') } as React.CSSProperties;

    const deleteSelf = () => {
        const index = parent?.children.indexOf(component);
        if(index !== undefined && index >= 0) parent?.children.splice(index, 1);
        if(hook) hook(null);
        closeMenu();
    };
    const changeBackground = (newColor: RGBColor) => onChange('background', [newColor.r, newColor.g, newColor.b]);
    const changeIcon = (offset: number) => onChange('iconShape', ((component.get('iconShape') ?? 0) + offset) % allIcons.length);
    const toggleCorrect = () => {
        if(setCorrect) setCorrect(!isCorrect);
        isCorrect = !isCorrect;
    };
    const handleMainContextMenu = (e?: React.MouseEvent) => {
        if(e) e.preventDefault();
        openMenu(
            component, [
                <p><strong>{component.get('label')}</strong></p>,
                <hr />,
                <ActionButton onClick={() => showBackgroundColorPicker()}><PaintRollerIcon /> Background</ActionButton>,
                <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "0.1rem"}}>
                    <ActionButton onClick={() => changeIcon(-1)}><ChevronLeftIcon size={16} /></ActionButton>
                    <ActionButton onClick={() => changeIcon(0)}><ShapesIcon /> Icon</ActionButton>
                    <ActionButton onClick={() => changeIcon(1)}><ChevronRightIcon size={16} /></ActionButton>
                </div>,
                <ActionButton onClick={toggleCorrect}>
                    <SquareCheckIcon /> Toggle
                </ActionButton>,
                <ActionButton theme="error" onClick={deleteSelf}><Trash2Icon /> Delete</ActionButton>
            ], e ? { x: e.clientX, y: e.clientY } : undefined
        );
    };
    const showBackgroundColorPicker = () => {
        setTimeout(() => openMenu(
            component, [
                <p><strong>{ component.get('label') }</strong></p>,
                <hr />,
                <EditorColorPicker defaultColor={component.get('background')} onChange={changeBackground} />,
                <ActionButton onClick={() => handleMainContextMenu()}><ArrowLeftCircle /> Back</ActionButton>
            ]
        ), 1);  // Timeout is required, otherwise the document trigger to close the context menu is called after rerendering, which hides the new context
    };

    return (
        <div 
            className={styles.answerBase} 
            style={inlineStyles}
            onClick={() => { if(!editor && hook) hook(null); }}
            onContextMenu={e => editor && handleMainContextMenu(e)}
        >
            <div className={styles.answerIcon}>
                <DynamicIcon name={getIcon(component.get('iconShape'))} size={36} strokeWidth={3}></DynamicIcon>
            </div>
            {editor && <DeleteButton className={styles.delete} callback={deleteSelf} />}
            {editor ? (
                <input className={styles.answerLabel} type="text" value={component.get('label')} onChange={(e) => onChange('label', e.target.value)} />
            ) : (
                <p className={styles.answerLabel}>{component.get('label')}</p>
            )}
            {editor && isCorrect && <p className={styles.correctAnswerTag} onClick={toggleCorrect}><CheckIcon width={24} color="#000000b0" strokeWidth={5}/></p>}
            {editor && !isCorrect && <p className={styles.incorrectAnswerTag} onClick={toggleCorrect}></p>}

            {children}
        </div>
    );
};

export const BinaryAnswer: FC<ReactAnswerComponent<BinaryAnswerComponent>> = ({ parent, component, editor, hook, isCorrect, setCorrect }) => {
    return <BaseAnswer parent={parent} component={component} editor={editor} hook={hook} isCorrect={isCorrect} setCorrect={setCorrect}></BaseAnswer>;
};

export const SimpleAnswer: FC<ReactAnswerComponent<SimpleAnswerComponent>> = ({ parent, component, editor, hook, isCorrect, setCorrect }) => {
    return <BaseAnswer parent={parent} component={component} editor={editor} hook={hook} isCorrect={isCorrect} setCorrect={setCorrect}></BaseAnswer>;
}

/**
 * Question Components
 */
export const BinaryQuestion: FC<ReactQuizzComponent<BinaryQuestionComponent>> = ({ component, editor, hook }) => {
    return (<div>
        <p>{component.children[0].get('label')}</p>
        <p>{component.children[1].get('label')}</p>
    </div>);
};

export const SimpleQuestion: FC<ReactQuestionComponent<SimpleQuestionComponent>> = ({ component, editor, hook, validAnswer, setValidAnswer, answerHook }) => {
    const onChange = (prop: keyof SimpleQuestionProps, value: any) => { component.set(prop, value); if(hook) hook(null); };
    if(validAnswer !== (component.get('answer') ?? 0)) setValidAnswer(component.get('answer') ?? 0);
    return (
        <>
            <div className={styles.questionTimer}>
                <AlarmClockIcon size={34} />
                { editor ?
                    <input className={styles.timerValue} value={component.get('time_limit')} onChange={(e) => onChange('time_limit', e.target.value)} /> :
                    <p className={styles.timerValue}>{component.get('time_limit')}</p>
                }
            </div>
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
                { component.children.map((ans, i) => 
                    <SimpleAnswer key={i} parent={component} component={ans} editor={editor} hook={() => {
                        if(!answerHook && hook) hook(null);
                        else if(answerHook) answerHook(i);
                    }}
                     isCorrect={validAnswer === i}
                     setCorrect={(correct) => { 
                        const newAnswer = correct ? i : -1;
                        component.set('answer', newAnswer);
                        setValidAnswer(newAnswer); 
                        if(hook) hook(null);
                    }}
                    />)
                }
                { editor && component.children.length < 4 && <AddAnswerButton callback={() => { component.addDefault(); if(hook) hook(null); }} /> }
            </div>
        </>
    );
};
