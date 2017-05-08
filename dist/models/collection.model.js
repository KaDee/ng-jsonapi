"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var links_model_1 = require("./links.model");
var CollectionModel = (function () {
    function CollectionModel(body) {
        this._links = new links_model_1.LinksModel;
        this._links.updateLinks(body.links);
        this._meta = body.meta;
    }
    Object.defineProperty(CollectionModel.prototype, "length", {
        get: function () {
            return _.isArrayLike(this._data) ? this._data.length : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionModel.prototype, "links", {
        get: function () {
            return this._links;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionModel.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionModel.prototype, "meta", {
        get: function () {
            return this._meta;
        },
        set: function (meta) {
            this._meta = meta;
        },
        enumerable: true,
        configurable: true
    });
    return CollectionModel;
}());
exports.CollectionModel = CollectionModel;
//# sourceMappingURL=collection.model.js.map