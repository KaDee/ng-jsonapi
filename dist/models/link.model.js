"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LinkModel = (function () {
    // TODO: add meta
    function LinkModel(name, link) {
        this._name = name;
        this._href = link;
    }
    Object.defineProperty(LinkModel.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LinkModel.prototype, "href", {
        get: function () {
            return this._href;
        },
        enumerable: true,
        configurable: true
    });
    return LinkModel;
}());
exports.LinkModel = LinkModel;
//# sourceMappingURL=link.model.js.map