import { LinksModel } from './links.model';
export declare class CollectionModel<T> {
    private _links;
    private _data;
    private _meta;
    constructor(body: any);
    readonly length: number;
    readonly links: LinksModel;
    data: T[];
    meta: T;
}
