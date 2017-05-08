"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var link_model_1 = require("./link.model");
var LinksModel = (function () {
    function LinksModel() {
    }
    LinksModel.prototype.updateLinks = function (links) {
        var _this = this;
        // delete all properties of this object
        Object.keys(this || {}).forEach(function (name) {
            delete _this[name];
        });
        // assign new properties based on whats inside of links
        Object.keys(links || {}).forEach(function (name) {
            _this[name] = new link_model_1.LinkModel(name, links[name]);
        });
    };
    return LinksModel;
}());
exports.LinksModel = LinksModel;
//# sourceMappingURL=links.model.js.map