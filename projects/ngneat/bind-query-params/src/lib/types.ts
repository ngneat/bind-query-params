import { QueryParamDef } from './QueryParamDef';

export type ParamDefType = 'boolean' | 'array' | 'number' | 'string' | 'object';

export type QueryDefOptions<QueryParams = any> = {
  queryKey: keyof QueryParams & string;
  path?: string;
  type?: ParamDefType;
  parser?: (value: string) => any;
  serializer?: (value: any) => string | null;
  syncInitialControlValue?: boolean;
  syncInitialQueryParamValue?: boolean;
  removeEmptyValue?: boolean;
};

export interface BindQueryParamsOptions {
  windowRef: Window;
}

export interface ResolveParamsOption<T = any> {
  def: QueryParamDef<T>;
  value: any;
}

export interface SyncDefsOptions {
  emitEvent: boolean;
}
