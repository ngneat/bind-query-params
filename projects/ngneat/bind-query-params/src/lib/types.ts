export type ParamDefType = 'boolean' | 'array' | 'number' | 'string' | 'object';

export type QueryParamParams<QueryParams = any> = {
  queryKey: keyof QueryParams & string;
  path?: string;
  type?: ParamDefType;
  strategy?: 'modelToUrl' | 'twoWay';
  parser?: (value: string) => any;
};

export interface BindQueryParamsOptions {
  windowRef: Window;
}
