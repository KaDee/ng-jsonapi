import { Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LinksModel } from './links.model';
import { DocumentModel } from './document.model';
export declare class JsonApiModel {
    id: string;
    private _links;
    [key: string]: any;
    constructor(data?: any);
    readonly links: LinksModel;
    syncRelationships(data: any, included: any, level: number): void;
    save(params?: any, headers?: Headers): Observable<DocumentModel<this>>;
    readonly hasDirtyAttributes: boolean;
    rollbackAttributes(): void;
    private parseHasMany(data, included, level);
    private parseBelongsTo(data, included, level);
    private getHasManyRelationship<T>(modelType, data, included, typeName, level);
    private getBelongsToRelationship<T>(modelType, data, included, typeName, level);
    private createOrPeek<T>(modelType, data);
}
