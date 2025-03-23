/**
 * Base type for component properties (every component will have these)
 */
export type BaseProps = {
    label?: string;  // Main text content
    thumbnail?: string;  // Thumbnail to be displayed (URL to image)
    background?: number[];  // Background (Color)
};

/**
 * TYPES FOR ANSWER COMPONENT PROPERTIES
 */
export type OpenAnswerProps = BaseProps & {
    // Properties are directly stored in the question since there's only one input here
};
export type BinaryAnswerProps = BaseProps & {
    // Correct answer is directly stored in the question properties since there's only one value that matters (true or false)
};
export type SimpleAnswerProps = BaseProps & { 
    // Correct answer is directly stored in the question properties
};
export type McqAnswerProps = BaseProps & {
    // Correct answers are directly stored in the question properties
};

/**
 * BASE TYPE FOR CONTAINERS (Question, Quizz)
 */
export type BaseContainerProps = BaseProps & {
    music?: string;  // URL to music ?
    description?: string;  // More information (in addition to the title)
};

/**
 * TYPE FOR QUESTION COMPONENT PROPERTIES
 */
export type BaseQuestionProps = BaseContainerProps & {
    time_limit?: number;
    // TODO : Points system property
};
export type OpenQuestionProps = BaseQuestionProps & {
    pattern?: string;  // The pattern the answer should follow
    minLength?: number;  // Minimum length for answers
    maxLength?: number;  // Maximum length for answers
};
export type BinaryQuestionProps = BaseQuestionProps & {
    answer?: boolean;  // If true, the first answer is correct.
};
export type SimpleQuestionProps = BaseQuestionProps & {
    answer?: number;  // Index to the correct answer
};
export type McqQuestionProps = BaseQuestionProps & {
    answer?: number[];  // Indices to correct answers
};


/**
 * TYPE FOR QUIZZ PROPERTIES
 */
export type SimpleQuizzProps = BaseContainerProps & {
    // TODO : Maybe nothing more? I don't know
};