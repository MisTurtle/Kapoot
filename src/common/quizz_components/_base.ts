import React from "react";

export const FIELD_PROPERTIES = 'properties';
export const FIELD_CHILDREN = 'children';
export const FIELD_TYPE = 'type';

export const defaultColors = [
    [66, 135, 245],  // Blue
    [245, 66, 66],  // Red
    [201, 154, 60],  // Yellow
    [50, 201, 76]  // Green
]

/**
 * Bottom-most level class extended by every quizz component
 */
export abstract class KapootLeafComponent<T extends Record<string, any>>
{
    public abstract defaultProperties: T;
    public static type: string;
    private _properties: Partial<T> = {};

    /**
     * @param properties An object of properties to be serialized with the element
     */
    constructor(properties: Partial<T>)
    {
        this._properties = properties;
    }

    public get type(): string {
        return (this.constructor as typeof KapootLeafComponent).type;
    }

    public get<K extends keyof T>(key: K): T[K] { return this._properties[key] ?? this.defaultProperties[key]; }
    public set<K extends keyof T>(key: K, value: T[K]): void { this._properties[key] = value; }
    public setAll(props: Partial<T>): void { Object.assign(this._properties, props); }
    public setAllIfUndefined(props: Partial<T>): void {
        for (const key in props) {
            if (this._properties[key] === undefined) {
                this._properties[key] = props[key] as T[typeof key];
            }
        }
    }

    /**
     * Called by JSON.stringify when serializing this object
     */
    public toJSON(): Record<string, any> {
        let properties = { ...this.defaultProperties } as Record<string, any>;
        Object.assign(properties, this._properties);
        return { [FIELD_TYPE]: this.type, [FIELD_PROPERTIES]: properties };
    }
}

/**
 * Base class for component containers, which are components themselves (e.g. Quizz, Question, Answer)
 * Template type T is the list of properties this container should have
 */
export abstract class KapootComponentContainer<T extends Record<string, any>> extends KapootLeafComponent<T>
{
    private _children: KapootLeafComponent<any>[] = [];

    constructor(properties: T, ...children: KapootLeafComponent<any>[]) {
        super(properties);
        this._children = children;
    }

    public get children() {
        return this._children; 
    }
    
    public toJSON(): object 
    {
        let thisJson = super.toJSON();
        thisJson[FIELD_CHILDREN] = this._children.map(child => child.toJSON());
        return thisJson;
    }
}
