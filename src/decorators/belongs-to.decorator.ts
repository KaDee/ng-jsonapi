export function BelongsTo(config: any = {}) {
  return function (target: any, propertyName: string | symbol) {
    let annotations = Reflect.getMetadata('BelongsTo', target) || [];
    annotations.push({
      propertyName: propertyName,
      relationship: config.key || propertyName,
      link: config.link || null
    });
    Reflect.defineMetadata('BelongsTo', annotations, target);
  };
}
