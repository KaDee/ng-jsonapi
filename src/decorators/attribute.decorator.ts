import * as moment from 'moment';
import { AttributeMetadata } from '../constants/symbols';

class DateConverter {
  mask(value: any) {
    return moment(value).toDate();
  }

  unmask(value: any) {
    return moment(value).format(moment.defaultFormatUtc);
  }
}

export function Attribute(config: any = {}) {
  return function (target: any, propertyName: string) {

    let converter = function(dataType: any, value: any, forSerialisation = false): any {
      let attrConverter;

      if (config.converter) {
        attrConverter = config.converter;
      } else if (dataType === Date) {
        attrConverter = new DateConverter();
      } else {
        const datatype = new dataType();

        if (datatype.mask && datatype.unmask) {
          attrConverter = datatype
        }
      }

      if (attrConverter) {
        if (!forSerialisation) {
          return attrConverter.mask(value);
        } else {
          return attrConverter.unmask(value);
        }
      }

      return value;
    };

    let saveAnnotations = function() {
      const metadata = Reflect.getMetadata('Attribute', target) || {};
      metadata[propertyName] = {
        marked: true
      };

      Reflect.defineMetadata('Attribute', metadata, target);
    };

    let setMetadata = function(hasDirtyAttributes: boolean, instance: any, oldValue: any, newValue: any, isNew: boolean) {
      let targetType = Reflect.getMetadata('design:type', target, propertyName);

      if (!instance[AttributeMetadata]) {
        instance[AttributeMetadata] = {};
      }

      hasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;
      instance[AttributeMetadata][propertyName] = {
        hasDirtyAttributes: hasDirtyAttributes,
        oldValue: oldValue,
        newValue: newValue,
        serialisationValue: converter(targetType, newValue, true)
      };
    };

    let getter = function () {
      return this['_' + propertyName];
    };

    let setter = function (newVal: any) {
      let targetType = Reflect.getMetadata('design:type', target, propertyName);
      let convertedValue = converter(targetType, newVal);
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
