import { QueryParamDef } from './QueryParamDef';

export type ParamDefType = 'boolean' | 'array' | 'number' | 'string' | 'object';

export type QueryParamParams<QueryParams = any> = {
  queryKey: keyof QueryParams & string;
  path?: string;
  type?: ParamDefType;
  strategy?: 'modelToUrl' | 'twoWay';
  parser?: (value: string) => any;
  serializer?: <T>(value: T) => string;
  setInitialValue?: boolean;
};

export interface BindQueryParamsOptions {
  windowRef: Window;
}

export interface ResolveParamsOption<T = any> {
  def: QueryParamDef<T>;
  value: any;
}
