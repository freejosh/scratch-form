declare module 'scratch-form/ScratchForm' {
  import { InputFieldElement } from 'scratch-form/dom';
  export interface ScratchFormData {
      [key: string]: unknown;
  }
  export interface ScratchFormOptions {
      onChange?: (name: string, value: unknown, node: InputFieldElement | undefined, obj: ScratchFormData) => void;
      event?: string;
  }

}
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
declare module 'scratch-form/name' {
  export function parseNamePath(str: string): string[];
  export function buildNamePath(arr: string[]): string;

}
declare module 'scratch-form/object' {
  type ObjectLike = Record<string, unknown>;
  export function setObjectValue(obj: ObjectLike, nameArg: string, value: unknown, del?: boolean): void;
  export function getObjectValue(obj: ObjectLike, nameArg: string): unknown;
  export function hasObjectValue(obj: ObjectLike, nameArg: string): boolean;
  export {};

}
declare module 'scratch-form' {
  import main = require('scratch-form/src/ScratchForm');
  export = main;
}