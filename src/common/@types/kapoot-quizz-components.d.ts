declare global {
    /**
     * Base type for component properties (every component will have these)
     */
    type BaseProps = {
        label?: string;  // Main text content
        iconShape?: number;  // Id to the shape
        thumbnail?: string;  // Thumbnail to be displayed (URL to image)
        background?: number[];  // Background (Color)
    };

    /**
     * TYPES FOR ANSWER COMPONENT PROPERTIES
     */
    type OpenAnswerProps = BaseProps & {
        // Properties are directly stored in the question since there's only one input here
    };
    type BinaryAnswerProps = BaseProps & {
        // Correct answer is directly stored in the question properties since there's only one value that matters (true or false)
    };
    type SimpleAnswerProps = BaseProps & { 
        // Correct answer is directly stored in the question properties
    };
    type McqAnswerProps = BaseProps & {
        // Correct answers are directly stored in the question properties
    };

    /**
     * BASE TYPE FOR CONTAINERS (Question, Quizz)
     */
    type BaseContainerProps = BaseProps & {
        music?: string;  // URL to music ?
        description?: string;  // More information (in addition to the title)
    };

    /**
     * TYPE FOR QUESTION COMPONENT PROPERTIES
     */
    type BaseQuestionProps = BaseContainerProps & {
        time_limit?: number;
        // TODO : Points system property
    };
    type OpenQuestionProps = BaseQuestionProps & {
        pattern?: string;  // The pattern the answer should follow
        minLength?: number;  // Minimum length for answers
        maxLength?: number;  // Maximum length for answers
    };
    type BinaryQuestionProps = BaseQuestionProps & {
        answer?: boolean;  // If true, the first answer is correct.
    };
    type SimpleQuestionProps = BaseQuestionProps & {
        answer?: number;  // Index to the correct answer
    };
    type McqQuestionProps = BaseQuestionProps & {
        answer?: number[];  // Indices to correct answers
    };


    /**
     * TYPE FOR QUIZZ PROPERTIES
     */
    type SimpleQuizzProps = BaseContainerProps & {
        // TODO : Maybe nothing more? I don't know
    };
}

export {};