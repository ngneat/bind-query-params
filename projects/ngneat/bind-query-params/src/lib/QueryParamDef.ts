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

  get syncOnlyInitialValue() {
    return this.config.syncOnlyInitialValue || false;
  }

  serialize(controlValue: any): string | null {
    if (this.serializer) {
      return this.serializer(controlValue);
    }

    if (controlValue === null || controlValue === undefined || controlValue === '') {
      return null;
    }

    const serializedValue = controlValue.toString();

    return serializedValue === '[object Object]' ? JSON.stringify(controlValue) : serializedValue;
  }

  parse(queryParamValue: string) {
    if (this.parser) {
      return this.parser(queryParamValue);
    }

    return parse(queryParamValue, this.type);
  }
}
