import { QueryDefOptions } from './types';
import { parse } from './utils';

export class QueryParamDef<QueryParams = any> {
  constructor(private config: QueryDefOptions<QueryParams>) {}

  get queryKey() {
    return this.config.queryKey;
  }

  get path() {
    return this.config.path || this.queryKey;
  }

  get type() {
    return this.config.type || 'string';
  }

  get parser() {
    return this.config.parser;
  }

  get syncInitialControlValue() {
    return this.config.syncInitialControlValue;
  }

  get syncInitialQueryParamValue() {
    return this.config.syncInitialQueryParamValue ?? true;
  }

  get removeEmptyValue() {
    return this.config.removeEmptyValue ?? true;
  }

  get serializer() {
    return this.config.serializer;
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
