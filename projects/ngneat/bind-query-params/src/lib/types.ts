import { QueryParamDef } from './QueryParamDef';

export type ParamDefType = 'boolean' | 'array' | 'number' | 'string' | 'object';

export type QueryParamParams<QueryParams = any> = {
  ignoreInvalidForm?: boolean;
  queryKey: keyof QueryParams & string;
  path?: string;
  type?: ParamDefType;
  strategy?: 'modelToUrl' | 'twoWay';
  parser?: (value: string) => any;
  serializer?: (value: unknown) => string;
};

export interface BindQueryParamsOptions {
  ignoreInvalidForm?: boolean;
  windowRef: Window;
}

export interface ResolveParamsOption<T = any> {
  def: QueryParamDef<T>;
  value: any;
}
