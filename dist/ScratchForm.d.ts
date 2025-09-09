declare module 'scratch-form/dom' {
  export type InputFieldElement = (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement);
  type NodeValue = string | number | undefined | FileList | null;
  export function getNodeValue(node: InputFieldElement): NodeValue;
  export function setNodeValue(node: InputFieldElement, value: unknown): void;
  export function collectNamedNodes(node: Element, list: Element[]): void;
  export type ArrayNodeCache = Record<string, Element[]>;
  export function cacheArrayNodes(formElement: HTMLFormElement): ArrayNodeCache;
  export function getArrayNodeIndex(node: Element, caches: ArrayNodeCache): number;
  export {};

}
declare module 'scratch-form/index' {
  import { InputFieldElement } from 'scratch-form/dom';
  import { DataObject } from 'scratch-form/object';
  interface ScratchFormOptions {
      onChange?: (name: string, value: unknown, node: InputFieldElement | undefined, obj: DataObject) => void;
      event?: string;
  }
  function ScratchForm(formElement: HTMLFormElement, options?: ScratchFormOptions): object;
  export default ScratchForm;

}
declare module 'scratch-form/name' {
  export function parseNamePath(str: string): string[];
  export function buildNamePath(arr: string[]): string;

}
declare module 'scratch-form/object' {
  export interface DataObject {
      [key: string]: unknown;
  }
  export function setObjectValue(obj: DataObject, nameArg: string, value: unknown, del?: boolean): void;
  export function getObjectValue(obj: DataObject, nameArg: string): unknown;
  export function hasObjectValue(obj: DataObject, nameArg: string): boolean;

}
declare module 'scratch-form' {
  import main = require('scratch-form/index');
  export = main;
}