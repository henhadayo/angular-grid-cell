import { Component, Input, OnInit, ComponentRef, OnDestroy, ViewContainerRef, Compiler, ComponentFactory, NgModule, ModuleWithComponentFactories, ReflectiveInjector, Type } from '@angular/core';
import { BaseElementComponent } from '../../../models/classes/base-element-component';
import { HtmlElement } from './classes/html-element';

export function createComponentFactory(compiler: Compiler, metadata: Component): Promise<ComponentFactory<any>> {
  const cmpClass = class DynamicComponent { };
  const decoratedCmp = Component(metadata)(cmpClass);

  @NgModule({
    declarations: [decoratedCmp]
  })
  class DynamicHtmlModule { }

  return compiler.compileModuleAndAllComponentsAsync(DynamicHtmlModule)
    .then((moduleWithComponentFactory: ModuleWithComponentFactories<any>) => {
      return moduleWithComponentFactory.componentFactories.find(x => x.componentType === decoratedCmp);
    });
}

export function createComponentFactoryWithModule(compiler: Compiler, metadata: Component, modules: Type<any> | Type<any>[]): Promise<ComponentFactory<any>> {
  const cmpClass = class DynamicComponent { };
  const decoratedCmp = Component(metadata)(cmpClass);

  @NgModule({
    imports: [modules],
    declarations: [decoratedCmp]
  })
  class DynamicHtmlModule { }

  return compiler.compileModuleAndAllComponentsAsync(DynamicHtmlModule)
    .then((moduleWithComponentFactory: ModuleWithComponentFactories<any>) => {
      return moduleWithComponentFactory.componentFactories.find(x => x.componentType === decoratedCmp);
    });
}

@Component({
  selector: 'tld-html-element',
  templateUrl: './html-element.component.html',
  styleUrls: ['./html-element.component.css']
})
export class HtmlElementComponent extends BaseElementComponent implements OnInit, OnDestroy {
  cmpRef: ComponentRef<any>;
  @Input() element: HtmlElement;
  @Input() data: any;

  constructor(private vcRef: ViewContainerRef, private compiler: Compiler) {
    super();
  }

  ngOnInit(): void {
    let template;

    if (this.cmpRef) {
      this.cmpRef.destroy();
    }

    if (typeof (this.element.html) === 'function') {
      template = this.element.html(this.data);
    } else {
      template = this.element.html;
    }

    const compMetadata = new Component({
      selector: 'dynamic-html',
      template: template
    });
    if (this.element.modules) {
      createComponentFactoryWithModule(this.compiler, compMetadata, this.element.modules).then(this.onFactoryResult());
    } else {
      createComponentFactory(this.compiler, compMetadata).then(this.onFactoryResult());
    }
  }

  private onFactoryResult(): (value: ComponentFactory<any>) => void | PromiseLike<void> {
    return factory => {
      const injector = ReflectiveInjector.fromResolvedProviders([], this.vcRef.parentInjector);
      this.cmpRef = this.vcRef.createComponent(factory, 0, injector, []);
      this.cmpRef.instance.element = this.element;
      this.cmpRef.instance.data = this.data;
      Object.getOwnPropertyNames(this.element.$scope).forEach(variableName => {
        this.cmpRef.instance[variableName] = this.element.$scope[variableName];
      });
      Object.getOwnPropertyNames(this.element.$scope.constructor.prototype).forEach(functionName => {
        this.cmpRef.instance[functionName] = this.element.$scope[functionName];
      });
    };
  }

  ngOnDestroy() {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
  }
}
