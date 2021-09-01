import { QueryParamParams } from './types';
import { parse } from './utils';

export class QueryParamDef<QueryParams = any> {
  constructor(private config: QueryParamParams<QueryParams>) {}

  get queryKey() {
    return this.config.queryKey;
  }

  get path() {
    return this.config.path || this.queryKey;
  }

  get type() {
    return this.config.type || 'string';
  }

  get strategy() {
    return this.config.strategy || 'twoWay';
  }

  get parser() {
    return this.config.parser;
  }

  get serializer() {
    return this.config.serializer;
  }

  serialize(controlValue: any): string | null {
    if (this.serializer) {
      return this.serializer(controlValue);
    }

    if (controlValue === null || controlValue === undefined) {
      return null;
    }

    let serializedValue = controlValue?.toString();

    if (controlValue.toString() === '[object Object]') {
      serializedValue = JSON.stringify(controlValue);
    }

    return serializedValue;
  }

  parse(queryParamValue: string) {
    if (this.parser) {
      return this.parser(queryParamValue);
    }

    return parse(queryParamValue, this.type);
  }
}
