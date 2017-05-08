"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var json_api_model_1 = require("../models/json-api.model");
var document_model_1 = require("../models/document.model");
var error_response_model_1 = require("../models/error-response.model");
var symbols_1 = require("../constants/symbols");
var collection_model_1 = require("../models/collection.model");
var JsonApiDatastore = (function () {
    function JsonApiDatastore(http) {
        this.http = http;
        this._store = {};
    }
    JsonApiDatastore.getRelationships = function (data) {
        var relationships = {};
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key] instanceof json_api_model_1.JsonApiModel) {
                    var relationshipType = Reflect.getMetadata('JsonApiModelConfig', data[key].constructor).type;
                    relationships[key] = {
                        data: {
                            type: relationshipType,
                            id: data[key].id
                        }
                    };
                }
            }
        }
        return relationships;
    };
    JsonApiDatastore.handleError = function (error) {
        var errMsg = (error.message) ? error.message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        try {
            var body = error.json();
            if (body.errors && body.errors instanceof Array) {
                var errors = new error_response_model_1.ErrorResponse(body.errors);
                console.error(errMsg, errors);
                return Observable_1.Observable.throw(errors);
            }
        }
        catch (e) {
            // no valid JSON
        }
        console.error(errMsg);
        return Observable_1.Observable.throw(errMsg);
    };
    JsonApiDatastore.toQueryString = function (params) {
        var encodedStr = '';
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                if (encodedStr && encodedStr[encodedStr.length - 1] !== '&') {
                    encodedStr = encodedStr + '&';
                }
                var value = params[key];
                if (value instanceof Array) {
                    for (var i = 0; i < value.length; i++) {
                        encodedStr = encodedStr + key + '=' + encodeURIComponent(value[i]) + '&';
                    }
                }
                else if (typeof value === 'object') {
                    for (var innerKey in value) {
                        if (value.hasOwnProperty(innerKey)) {
                            encodedStr = encodedStr + key + '[' + innerKey + ']=' + encodeURIComponent(value[innerKey]) + '&';
                        }
                    }
                }
                else {
                    encodedStr = encodedStr + key + '=' + encodeURIComponent(value);
                }
            }
        }
        if (encodedStr[encodedStr.length - 1] === '&') {
            encodedStr = encodedStr.substr(0, encodedStr.length - 1);
        }
        return encodedStr;
    };
    JsonApiDatastore.makeUrl = function (url, params) {
        return [url, (params ? '?' : ''), JsonApiDatastore.toQueryString(params)].join('');
    };
    JsonApiDatastore.fromArrayToHash = function (models) {
        var modelsArray = models instanceof Array ? models : [models];
        return _.keyBy(modelsArray, 'id');
    };
    //noinspection JSUnusedLocalSymbols
    JsonApiDatastore.resetMetadataAttributes = function (res, attributesMetadata, modelType) {
        attributesMetadata = res[symbols_1.AttributeMetadata];
        for (var propertyName in attributesMetadata) {
            if (attributesMetadata.hasOwnProperty(propertyName)) {
                var metadata = attributesMetadata[propertyName];
                if (metadata.hasDirtyAttributes) {
                    metadata.hasDirtyAttributes = false;
                }
            }
        }
        res[symbols_1.AttributeMetadata] = attributesMetadata;
        return res;
    };
    JsonApiDatastore.prototype.query = function (modelType, params, headers) {
        var _this = this;
        var options = this.getOptions(headers);
        var url = this.buildUrl(modelType, params);
        return this.http.get(url, options)
            .map(function (res) { return _this.extractQueryData(res, modelType); })
            .catch(function (res) { return JsonApiDatastore.handleError(res); });
    };
    JsonApiDatastore.prototype.hasManyLink = function (modelType, url, params, headers) {
        var _this = this;
        var options = this.getOptions(headers);
        var _url = JsonApiDatastore.makeUrl(url, params);
        return this.http.get(_url, options)
            .map(function (res) { return _this.extractQueryData(res, modelType); })
            .catch(function (res) { return JsonApiDatastore.handleError(res); });
    };
    JsonApiDatastore.prototype.findRecord = function (modelType, id, params, headers) {
        var _this = this;
        var options = this.getOptions(headers);
        var url = this.buildUrl(modelType, params, id);
        return this.http.get(url, options)
            .map(function (res) { return _this.extractRecordData(res, modelType); })
            .catch(function (res) { return JsonApiDatastore.handleError(res); });
    };
    JsonApiDatastore.prototype.belongsToLink = function (modelType, url, params, headers) {
        var _this = this;
        var options = this.getOptions(headers);
        var _url = JsonApiDatastore.makeUrl(url, params);
        return this.http.get(_url, options)
            .map(function (res) { return _this.extractRecordData(res, modelType); })
            .catch(function (res) { return JsonApiDatastore.handleError(res); });
    };
    JsonApiDatastore.prototype.createRecord = function (modelType, data) {
        return new modelType(this, { attributes: data });
    };
    JsonApiDatastore.prototype.saveRecord = function (attributesMetadata, model, params, headers) {
        var _this = this;
        var modelType = model.constructor;
        var typeName = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        var options = this.getOptions(headers);
        var relationships = JsonApiDatastore.getRelationships(model);
        var url = this.buildUrl(modelType, params, model.id);
        var dirtyData = {};
        for (var propertyName in attributesMetadata) {
            if (attributesMetadata.hasOwnProperty(propertyName)) {
                var metadata = attributesMetadata[propertyName];
                dirtyData[propertyName] = metadata.serialisationValue ? metadata.serialisationValue : metadata.newValue;
            }
        }
        var httpCall;
        var body = {
            data: {
                type: typeName,
                id: model.id,
                attributes: dirtyData,
                relationships: relationships
            }
        };
        if (model.id) {
            httpCall = this.http.patch(url, body, options);
        }
        else {
            httpCall = this.http.post(url, body, options);
        }
        return httpCall
            .map(function (res) { return _this.extractRecordData(res, modelType, model); })
            .map(function (res) { return JsonApiDatastore.resetMetadataAttributes(res, attributesMetadata, modelType); })
            .map(function (res) { return _this.updateRelationships(res, relationships); })
            .catch(function (res) { return JsonApiDatastore.handleError(res); });
    };
    JsonApiDatastore.prototype.deleteRecord = function (modelType, id, headers) {
        var options = this.getOptions(headers);
        var url = this.buildUrl(modelType, null, id);
        return this.http.delete(url, options)
            .catch(function (res) { return JsonApiDatastore.handleError(res); });
    };
    JsonApiDatastore.prototype.peekRecord = function (modelType, id) {
        var type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        return this._store[type] ? this._store[type][id] : null;
    };
    JsonApiDatastore.prototype.peekAll = function (modelType) {
        var type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        return _.values(this._store[type]);
    };
    Object.defineProperty(JsonApiDatastore.prototype, "headers", {
        set: function (headers) {
            this._headers = headers;
        },
        enumerable: true,
        configurable: true
    });
    JsonApiDatastore.prototype.buildUrl = function (modelType, params, id) {
        var typeName = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        var baseUrl = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).baseUrl;
        var idToken = id ? "/" + id : null;
        return JsonApiDatastore.makeUrl([baseUrl, typeName, idToken].join(''), params);
    };
    JsonApiDatastore.prototype.extractQueryData = function (res, modelType) {
        var _this = this;
        var body = res.json();
        var models = [];
        var collection = new collection_model_1.CollectionModel(body);
        body.data.forEach(function (data) {
            var model = new modelType(_this, data);
            _this.addToStore(model);
            if (body.included) {
                model.syncRelationships(data, body.included, 0);
                _this.addToStore(model);
            }
            models.push(model);
        });
        collection.data = models;
        return collection;
    };
    JsonApiDatastore.prototype.extractRecordData = function (res, modelType, model) {
        var _this = this;
        var body = res.json ? res.json() : res;
        var document = new document_model_1.DocumentModel(body);
        if (model) {
            model.id = body.data.id;
            _.extend(model, body.data.attributes);
        }
        model = model || new modelType(this, body.data);
        this.addToStore(model);
        if (body.included) {
            model.syncRelationships(body.data, body.included, 0);
            this.addToStore(model);
            body.included.forEach(function (includedModelData) {
                var models = Reflect.getMetadata('JsonApiDatastoreConfig', _this.constructor).models;
                _this.extractRecordData({ data: includedModelData }, models[includedModelData.type]);
            });
        }
        document.data = model;
        return document;
    };
    JsonApiDatastore.prototype.getOptions = function (customHeaders) {
        var requestHeaders = new http_1.Headers();
        requestHeaders.set('Accept', 'application/vnd.api+json');
        requestHeaders.set('Content-Type', 'application/vnd.api+json');
        if (this._headers) {
            this._headers.forEach(function (values, name) {
                requestHeaders.set(name, values);
            });
        }
        if (customHeaders) {
            customHeaders.forEach(function (values, name) {
                requestHeaders.set(name, values);
            });
        }
        return new http_1.RequestOptions({ headers: requestHeaders });
    };
    JsonApiDatastore.prototype.addToStore = function (models) {
        var model = models instanceof Array ? models[0] : models;
        var type = Reflect.getMetadata('JsonApiModelConfig', model.constructor).type;
        if (!this._store[type]) {
            this._store[type] = {};
        }
        var hash = JsonApiDatastore.fromArrayToHash(models);
        _.extend(this._store[type], hash);
    };
    JsonApiDatastore.prototype.updateRelationships = function (model, relationships) {
        var modelsTypes = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).models;
        for (var relationship in relationships) {
            if (relationships.hasOwnProperty(relationship) && model.hasOwnProperty(relationship)) {
                var relationshipModel = model[relationship];
                var hasMany = Reflect.getMetadata('HasMany', relationshipModel);
                var propertyHasMany = _.find(hasMany, function (property) {
                    return modelsTypes[property.relationship] === model.constructor;
                });
                if (propertyHasMany && relationshipModel[propertyHasMany.propertyName]) {
                    relationshipModel[propertyHasMany.propertyName].push(model);
                }
            }
        }
        return model;
    };
    ;
    JsonApiDatastore.prototype.setBaseUrl = function (baseUrl) {
        Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).baseUrl = baseUrl;
    };
    return JsonApiDatastore;
}());
JsonApiDatastore.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
JsonApiDatastore.ctorParameters = function () { return [
    { type: http_1.Http, },
]; };
exports.JsonApiDatastore = JsonApiDatastore;
//# sourceMappingURL=json-api-datastore.service.js.map