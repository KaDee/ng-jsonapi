"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var symbols_1 = require("../constants/symbols");
var DateConverter = (function () {
    function DateConverter() {
    }
    DateConverter.prototype.mask = function (value) {
        return moment(value).toDate();
    };
    DateConverter.prototype.unmask = function (value) {
        return moment(value).format(moment.defaultFormatUtc);
    };
    return DateConverter;
}());
function Attribute(config) {
    if (config === void 0) { config = {}; }
    return function (target, propertyName) {
        var converter = function (dataType, value, forSerialisation) {
            if (forSerialisation === void 0) { forSerialisation = false; }
            var attrConverter;
            if (config.converter) {
                attrConverter = config.converter;
            }
            else if (dataType === Date) {
                attrConverter = new DateConverter();
            }
            else {
                var datatype = new dataType();
                if (datatype.mask && datatype.unmask) {
                    attrConverter = datatype;
                }
            }
            if (attrConverter) {
                if (!forSerialisation) {
                    return attrConverter.mask(value);
                }
                else {
                    return attrConverter.unmask(value);
                }
            }
            return value;
        };
        var saveAnnotations = function () {
            var metadata = Reflect.getMetadata('Attribute', target) || {};
            metadata[propertyName] = {
                marked: true
            };
            Reflect.defineMetadata('Attribute', metadata, target);
        };
        var setMetadata = function (hasDirtyAttributes, instance, oldValue, newValue, isNew) {
            var targetType = Reflect.getMetadata('design:type', target, propertyName);
            if (!instance[symbols_1.AttributeMetadata]) {
                instance[symbols_1.AttributeMetadata] = {};
            }
            hasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;
            instance[symbols_1.AttributeMetadata][propertyName] = {
                hasDirtyAttributes: hasDirtyAttributes,
                oldValue: oldValue,
                newValue: newValue,
                serialisationValue: converter(targetType, newValue, true)
            };
        };
        var getter = function () {
            return this['_' + propertyName];
        };
        var setter = function (newVal) {
            var targetType = Reflect.getMetadata('design:type', target, propertyName);
            var convertedValue = converter(targetType, newVal);
            if (convertedValue !== this['_' + propertyName]) {
                setMetadata(true, this, this['_' + propertyName], newVal, !this.id);
                this['_' + propertyName] = convertedValue;
            }
        };
        if (delete target[propertyName]) {
            saveAnnotations();
            Object.defineProperty(target, propertyName, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
    };
}
exports.Attribute = Attribute;
//# sourceMappingURL=attribute.decorator.js.map