import { GenerateIdAttr } from '../types/generate-id-attr';

export abstract class Element {
  type?: string;
  elementField?: string | Function;
  elementId?: string | GenerateIdAttr;
  class?: string;
  tooltip?: string | Function;
  getNgClass?: (data: {}) => {};
  onClick?: (data: any, event: MouseEvent) => any;
}
