export const FIELD_PROPERTIES = 'p';
export const FIELD_CHILDREN = 'c';
export const FIELD_TYPE = 't';

/**
 * Bottom-most level class extended by every quizz component
 */
export abstract class KapootLeafComponent<T extends Record<string, any>>
{
    public abstract defaultProperties: T;
    private _properties: T;

    /**
     * @param properties An object of properties to be serialized with the element
     */
    constructor(properties: T)
    {
        this._properties = properties;
    }

    public get<K extends keyof T>(key: K): T[K] { return this._properties[key] ?? this.defaultProperties[key]; }
    public set<K extends keyof T>(key: K, value: T[K]): void { this._properties[key] = value; }

    /**
     * Called by JSON.stringify when serializing this object
     */
    public toJSON(): object {
        let properties= { ...this.defaultProperties } as Record<string, any>;
        Object.entries(this._properties).forEach(([key, val]) => { properties[key] = val; })
        return properties;
    }
}

/**
 * Base class for component containers, which are components themselves (e.g. Quizz, Question, Answer)
 * Template type T is the list of properties this container should have
 */
export abstract class KapootComponentContainer<T extends Record<string, any>> extends KapootLeafComponent<T>
{
    private _children: KapootLeafComponent<T>[];

    constructor(properties: T, ...children: KapootLeafComponent<any>[]) {
        super(properties);
        this._children = children;
    }
    
    public toJSON(): object 
    {
        const properties = super.toJSON();
        return {
            [FIELD_PROPERTIES]: properties,
            [FIELD_CHILDREN]: this._children.map(child => child.toJSON())
        };
    }
}
