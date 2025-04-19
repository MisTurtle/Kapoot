import { FIELD_CHILDREN, FIELD_PROPERTIES, FIELD_TYPE, KapootComponentContainer, KapootLeafComponent } from "./base";
import { defaultColors } from "@common/constants";

/**
 * Answer components
 */
export class OpenAnswerComponent extends KapootLeafComponent<OpenAnswerProps>
{
    public defaultProperties: OpenAnswerProps = { };
    public static type: string = 'a:open';
}

export class BinaryAnswerComponent extends KapootLeafComponent<BinaryAnswerProps>
{
    public defaultProperties: BinaryAnswerProps = { };
    public static type: string = 'a:bin';
}

export class SimpleAnswerComponent extends KapootLeafComponent<SimpleAnswerProps>
{
    public defaultProperties: SimpleAnswerProps = { };
    public static type: string = 'a:simple';
}

export class McqAnswerComponent extends KapootLeafComponent<McqAnswerProps>
{
    public defaultProperties: McqAnswerProps = { };
    public static type: string = 'a:mcq';    
}


/**
 * Question components
 * 
 * We necessarily have to separate the server and client versions here, because otherwise the client would be able to see the right answers from request data
 * A way to remove answer properties needs to be found before sending them to the client if we want to reuse these classes with a render() function
 */
export abstract class QuestionComponent<T extends Record<string, any>> extends KapootComponentContainer<T> {
    abstract checkAnswer(answer: any): boolean;
}

export class OpenQuestionComponent extends QuestionComponent<OpenQuestionProps>
{
    public defaultProperties: OpenQuestionProps = { }
    public static type: string = 'q:open';

    constructor(properties: OpenQuestionProps, answerComponent: OpenAnswerComponent)
    {
        super(properties, answerComponent);
    }

    public addDefault(): OpenAnswerComponent {
        if(this.children.length > 0) throw new Error("Open questions can only have one child");
        this.children.push(new OpenAnswerComponent({}));
        this.fillChildProps(this.children[0], 0);
        return this.children[0];
    }

    public fillChildProps(child: KapootLeafComponent<any>, _: number): void {
        child.setAllIfUndefined({'label': 'Open Answer'});
    }
    
    checkAnswer(answer: any): boolean {
        throw new Error("Method not implemented.");
    }
}

export class BinaryQuestionComponent extends QuestionComponent<BinaryQuestionProps>
{
    public defaultProperties: BinaryQuestionProps = { };
    public static type: string = 'q:bin';

    constructor(properties: BinaryQuestionProps, answerTrue: BinaryAnswerComponent, answerFalse: BinaryAnswerComponent) 
    {
        super(properties, answerTrue, answerFalse);
    }

    public addDefault(): BinaryAnswerComponent {
        if(this.children.length >= 2) throw new Error("Binary questions can only have two answer components");
        const ans = new BinaryAnswerComponent({});
        this.fillChildProps(ans, this.children.length);
        this.children.push(ans);
        return ans;
    }

    public fillChildProps(child: KapootLeafComponent<any>, index: number): void {
        if(index < 0 || index > 1) throw new Error("Binary question can only have two answer components");
        child.setAllIfUndefined({'label': ['Yes', 'No'][index], 'background': defaultColors[index], iconShape: index});
    }
    
    checkAnswer(answer: any): boolean {
        throw new Error("Method not implemented.");
    }
}

export class SimpleQuestionComponent extends QuestionComponent<SimpleQuestionProps>
{
    public defaultProperties: SimpleQuestionProps = { };
    public static type: string = 'q:simple';

    constructor(properties: SimpleQuestionProps, ...answers: SimpleAnswerComponent[])
    {
        super(properties, ...answers);
    }

    public addDefault(): SimpleAnswerComponent {
        if(this.children.length >= 4) throw new Error("Simple questions cannot have more than 4 answers");
        const ans = new SimpleAnswerComponent({});
        this.fillChildProps(ans, this.children.length);
        this.children.push(ans);
        return ans;
    }

    public fillChildProps(child: KapootLeafComponent<any>, index: number): void {
        child.setAllIfUndefined({'label': `Answer #${index}`, 'background': defaultColors[index], 'iconShape': index});
    }

    static deserialize_component(data: { [FIELD_TYPE]: string, [FIELD_PROPERTIES]: SimpleQuestionProps, [FIELD_CHILDREN]: any[] }): SimpleAnswerComponent
    {
        console.log("Question children:", data[FIELD_CHILDREN]);
        const ans = data[FIELD_CHILDREN].map((props: any) => new SimpleAnswerComponent(props));
        return new SimpleQuestionComponent(data[FIELD_PROPERTIES], ...ans);
    }
    
    checkAnswer(answer: any): boolean {
        return answer === this.get('answer');
    }
}

export class McqQuestionComponent extends QuestionComponent<McqQuestionProps>
{
    public defaultProperties: McqQuestionProps = { };
    public static type: string = 'q:mcq';

    constructor(properties: McqQuestionProps, ...answers: McqAnswerComponent[])
    {
        super(properties, ...answers);
    }

    public addDefault(): McqAnswerComponent {
        if(this.children.length >= 4) throw new Error("Multiple choice questions cannot have more than 4 answers");
        const ans = new McqAnswerComponent({});
        this.fillChildProps(ans, this.children.length);
        this.children.push(ans);
        return ans;
    }

    public fillChildProps(child: KapootLeafComponent<any>, index: number): void {
        child.setAllIfUndefined({'label': `Answer #${index}`, 'background': defaultColors[index], 'iconShape': index});
    }
    
    checkAnswer(answer: any): boolean {
        throw new Error("Method not implemented.");
    }
}

/**
 * Quizz components
 */
export abstract class QuizzComponent<T extends Record<string, any>> extends KapootComponentContainer<T> { }
export class SimpleQuizzComponent extends QuizzComponent<SimpleQuizzProps>
{
    public defaultProperties: SimpleQuizzProps = { };
    public static type: string = 'quizz:simple';
    
    constructor(properties: SimpleQuizzProps, ...questions: QuestionComponent<any>[])
    {
        if(!properties.label) properties.label = "New Quizz";
        super(properties, ...questions);
    }

    static deserialize_component(data: { [FIELD_TYPE]: string, [FIELD_PROPERTIES]: SimpleQuestionProps, [FIELD_CHILDREN]: any[] }): SimpleQuizzComponent {
        const quizzProperties = data[FIELD_PROPERTIES];
        const quizzChildren = data[FIELD_CHILDREN];
        const questions = (quizzChildren ?? []).map(q => deserialize_component(q)) as QuestionComponent<any>[];
        return new SimpleQuizzComponent(quizzProperties, ...questions);
    }

    /**
     * @deprecated Use global components.deserialize_component function instead
     */
    static deserialize(data: any): SimpleQuizzComponent {
        // TODO : Sanitize values before setting them (format, ranges, ...)
        if(typeof data === 'string') data = JSON.parse(data);

        const quizzProperties = data[FIELD_PROPERTIES] ?? {};
        const quizzChildren = data[FIELD_CHILDREN];  // [ {type: 'questionType', children: questionAnswers, properties: {...questionProperties} ]

        const questions: QuestionComponent<any>[] = (quizzChildren ?? []).map((q: any) => {
            const properties = q[FIELD_PROPERTIES];  // { ...questionProperties }
            const children: { type: string, properties: any }[] = q[FIELD_CHILDREN];  // { type: 'answerType', properties: { ...childProperties }}
            const childProperties: Partial<BaseProps>[] = children.map(child => child.properties);
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

    public addDefault(): SimpleQuestionComponent {
        const question = new SimpleQuestionComponent({});
        for(let i = 0; i < 4; ++i) question.addDefault();
        this.fillChildProps(question, this.children.length);
        this.children.push(question);
        return question;
    }

    public fillChildProps(child: KapootLeafComponent<any>, index: number): void {
        child.setAllIfUndefined({ label: `Question #${index}`, time_limit: 60 });    
    }
}

export function emptyQuizz() { return new SimpleQuizzComponent({}); }
export function deserialize_component(data: any): KapootLeafComponent<any> | undefined
{
    if(typeof data === 'string') data = JSON.parse(data);
    console.log("Deserializing component ", data);

    switch(data[FIELD_TYPE])
    {
        case 'a:open':
        case 'a:bin':
        case 'a:mcq':
        case 'a:simple':
            throw new Error("Not implemented yet.");
            break;  // TODO : Implement these, but not necessary for a first presentation
        
        case 'q:open':
        case 'q:bin':
        case 'q:mcq':
            throw new Error("Not implemented yet.");
            break;  // TODO : Implement these
        case 'q:simple':
            return SimpleQuestionComponent.deserialize_component(data);
        
        case 'quizz:simple':
            return SimpleQuizzComponent.deserialize_component(data);
    }
}
