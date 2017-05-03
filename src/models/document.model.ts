import { LinksModel } from './links.model';

export class DocumentModel<T> {
  private _links: LinksModel = new LinksModel;
  private _data: T;
  private _meta: T;

  constructor(body: any) {
    this._links.updateLinks(body.links);
    this._meta = body.meta;
  }

  get links() {
    return this._links;
  }

  get data(): T {
    return this._data;
  }

  set data(data: T) {
    this._data = data;
  }

  set meta(meta: T) {
    this._meta = meta;
  }

  get meta() {
    return this._meta;
  }
}
