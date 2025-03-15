import { defaultColors, FIELD_CHILDREN, FIELD_PROPERTIES, FIELD_TYPE, KapootComponentContainer, KapootLeafComponent } from "./_base";
import * as types from "./_types";

/**
 * Answer components
 */
// These might look useless but will (probably) be convenient later on when everything is of the same type
export class OpenAnswerComponent extends KapootLeafComponent<types.OpenAnswerProps>
{
    public defaultProperties: types.OpenAnswerProps = { };
    public type: string = 'a:open';
}

export class BinaryAnswerComponent extends KapootLeafComponent<types.BinaryAnswerProps>
{
    public defaultProperties: types.BinaryAnswerProps = { };
    public type: string = 'a:bin';
}

export class SimpleAnswerComponent extends KapootLeafComponent<types.SimpleAnswerProps>
{
    public defaultProperties: types.SimpleAnswerProps = { };
    public type: string = 'a:simple';
}

export class McqAnswerComponent extends KapootLeafComponent<types.McqAnswerProps>
{
    public defaultProperties: types.McqAnswerProps = { };
    public type: string = 'a:mcq';
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
    public defaultProperties: types.OpenQuestionProps = { }
    public type: string = 'q:open';

    constructor(properties: types.OpenQuestionProps, answerComponent: OpenAnswerComponent)
    {
        super(properties, answerComponent);
        if(!answerComponent.get('label')) answerComponent.set('label', 'Open Answer');
    }
}

export class BinaryQuestionComponent extends QuestionComponent<types.BinaryQuestionProps>
{
    public defaultProperties: types.BinaryQuestionProps = { };
    public type: string = 'q:bin';

    constructor(properties: types.BinaryQuestionProps, answerTrue: BinaryAnswerComponent, answerFalse: BinaryAnswerComponent) 
    {
        super(properties, answerTrue, answerFalse);
        answerTrue.setAllIfUndefined({'label': 'Yes', 'background': defaultColors[0]});
        answerFalse.setAllIfUndefined({'label': 'No', 'background': defaultColors[1]});
    }
}

export class SimpleQuestionComponent extends QuestionComponent<types.SimpleQuestionProps>
{
    public defaultProperties: types.SimpleQuestionProps = { };
    public type: string = 'q:simple';

    constructor(properties: types.SimpleQuestionProps, ...answers: SimpleAnswerComponent[])
    {
        super(properties, ...answers);
        answers.forEach((ans, i) => ans.setAllIfUndefined({'label': `Answer #${i}`, 'background': defaultColors[i]}));
    }
}

export class McqQuestionComponent extends QuestionComponent<types.McqQuestionProps>
{
    public defaultProperties: types.McqQuestionProps = { };
    public type: string = 'q:mcq';

    constructor(properties: types.McqQuestionProps, ...answers: McqAnswerComponent[])
    {
        super(properties, ...answers);
        answers.forEach((ans, i) => ans.setAllIfUndefined({'label': `Answer #${i}`, 'background': defaultColors[i]}));
    }
}

/**
 * Quizz components
 */
export abstract class QuizzComponent<T extends Record<string, any>> extends KapootComponentContainer<T> { }
export class SimpleQuizzComponent extends QuizzComponent<types.SimpleQuizzProps>
{
    public defaultProperties: types.SimpleQuizzProps = { };
    public type: string = 'quizz:simple';
    
    constructor(properties: types.SimpleQuizzProps, ...questions: QuestionComponent<any>[])
    {
        super(properties, ...questions);
    }

    static deserialize(data: any): SimpleQuizzComponent {
        const quizzProperties = data[FIELD_PROPERTIES];
        const quizzChildren = data[FIELD_CHILDREN];  // [ {type: 'questionType', children: questionAnswers, properties: {...questionProperties} ]

        const questions = (quizzChildren ?? []).map((q: any) => {
            const properties = q[FIELD_PROPERTIES];  // { ...questionProperties }
            const children: { type: string, properties: any }[] = q[FIELD_CHILDREN];  // { type: 'answerType', properties: { ...childProperties }}
            const childProperties: Partial<types.BaseProps>[] = children.map(child => child.properties);
            const type = q[FIELD_TYPE];  // string
            let ans = undefined;

            // Answer types aren't actually checked before being passed to an answer's constructor
            // But let's keep the type in case we ever need it for custom deserialization
            switch (type) {
                case 'q:open': 
                    ans = new OpenAnswerComponent(childProperties[0]);
                    return new OpenQuestionComponent(properties, ans);
                case 'q:bin': 
                    ans = [ new BinaryAnswerComponent(childProperties[0]), new BinaryAnswerComponent(childProperties[1]) ];
                    return new BinaryQuestionComponent(properties, ans[0], ans[1]);
                case 'q:simple':
                    ans = (childProperties || []).map((props: any) => new SimpleAnswerComponent(props))
                    return new SimpleQuestionComponent(properties, ...ans);
                case 'q:mcq':
                    ans = (childProperties || []).map((props: any) => new McqAnswerComponent(props))
                    return new McqQuestionComponent(properties, ...ans);
                default: 
                    throw new Error(`Unknown question type: ${q.type}`);
            }
        });
        
        return new SimpleQuizzComponent(quizzProperties, ...questions);
    }
    
}

export function emptyQuizz() { return new SimpleQuizzComponent({}); }
