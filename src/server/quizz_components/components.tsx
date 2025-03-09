import { KapootComponentContainer, KapootLeafComponent } from "./_base";
import * as types from "./_types";

/**
 * Answer components
 */
// These might look useless but will (probably) be convenient later on when everything is of the same type
export class OpenAnswerComponent extends KapootLeafComponent<types.OpenAnswerProps>
{
    public defaultProperties: types.OpenAnswerProps = { type: 'a:open' };
}

export class BinaryAnswerComponent extends KapootLeafComponent<types.BinaryAnswerProps>
{
    public defaultProperties: types.BinaryAnswerProps = { type: 'a:bin' };
}

export class SimpleAnswerComponent extends KapootLeafComponent<types.SimpleAnswerProps>
{
    public defaultProperties: types.SimpleAnswerProps = { type: 'a:simple' };
}

export class McqAnswerComponent extends KapootLeafComponent<types.McqAnswerProps>
{
    public defaultProperties: types.McqAnswerProps = { type: 'a:mcq' };
}


/**
 * Question components
 * 
 * We necessarily have to separate the server and client versions here, because otherwise the client would be able to see the right answers from request data
 * A way to remove answer properties needs to be found before sending them to the client if we want to reuse these classes with a render() function
 */
export abstract class QuestionComponent<T extends Record<string, any>> extends KapootComponentContainer<T> { }

export class OpenQuestionComponent extends QuestionComponent<types.OpenQuestionProps>
{
    public defaultProperties: types.OpenQuestionProps = { type: 'q:open' }

    constructor(properties: types.OpenQuestionProps, answerComponent: OpenAnswerComponent)
    {
        super(properties, answerComponent);
    }
}

export class BinaryQuestionComponent extends QuestionComponent<types.BinaryQuestionProps>
{
    public defaultProperties: types.BinaryQuestionProps = { type: 'q:bin' };

    constructor(properties: types.BinaryQuestionProps, answerTrue: BinaryAnswerComponent, answerFalse: BinaryAnswerComponent) 
    {
        super(properties, answerTrue, answerFalse);
    }
}

export class SimpleQuestionComponent extends QuestionComponent<types.SimpleQuestionProps>
{
    public defaultProperties: types.SimpleQuestionProps = { type: 'q:simple' };

    constructor(properties: types.SimpleQuestionProps, ...answers: SimpleAnswerComponent[])
    {
        super(properties, ...answers);
    }
}

export class McqQuestionComponent extends QuestionComponent<types.McqQuestionProps>
{
    public defaultProperties: types.McqQuestionProps = { type: 'q:mcq' };

    constructor(properties: types.McqQuestionProps, ...answers: McqAnswerComponent[])
    {
        super(properties, ...answers);
    }
}

/**
 * Quizz components
 */
export abstract class QuizzComponent<T extends Record<string, any>> extends KapootComponentContainer<T> { }
export class SimpleQuizzComponent extends QuizzComponent<types.SimpleQuizzProps>
{
    public defaultProperties: types.SimpleQuizzProps = { type: 'quizz:simple' };
    
    constructor(properties: types.SimpleQuizzProps, ...questions: QuestionComponent<any>[])
    {
        super(properties, ...questions);
    }
}

export function emptyQuizz() { return new SimpleQuizzComponent({}); }
