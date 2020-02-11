import { Element } from '../../../../models/classes/element';
import { Type } from '@angular/core';

export class HtmlElement extends Element {
  html: string | Function;
  module: Type<any>;

  constructor(html: string | Function, module?: Type<any>, options?: Element) {
    super();
    this.type = 'html';
    this.html = html;
    this.module = module;
    if (options) {
      Object.assign(this, options);
    }
  }
}
