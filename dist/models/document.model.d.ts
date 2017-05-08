import { LinksModel } from './links.model';
export declare class DocumentModel<T> {
    private _links;
    private _data;
    private _meta;
    constructor(body: any);
    readonly links: LinksModel;
    data: T;
    meta: T;
}
