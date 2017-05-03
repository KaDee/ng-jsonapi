import * as _ from 'lodash';
import { LinksModel } from './links.model';

export class CollectionModel<T> {
  private _links: LinksModel = new LinksModel;
  private _data: T[];
  private _meta: T;

  constructor(body: any) {
    this._links.updateLinks(body.links);
    this._meta = body.meta;
  }

  get length(): number {
    return _.isArrayLike(this._data) ? this._data.length : 0;
  }

  get links() {
    return this._links;
  }

  get data(): T[] {
    return this._data;
  }

  set data(data: T[]) {
    this._data = data;
  }

  set meta(meta: T) {
    this._meta = meta;
  }

  get meta() {
    return this._meta;
  }
}
