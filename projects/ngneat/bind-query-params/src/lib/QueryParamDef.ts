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

  parse(queryParamValue: string) {
    return parse(queryParamValue, this.type);
  }
}
