export type OnFulfilled = (value?: any) => void;

export type OnRejected = (reason?: any) => void;

export type PromiseFn = (resolve: OnFulfilled, reject: OnRejected) => void;

export enum PromiseState {
  'PENDING',
  'FULFILLED',
  'REJECTED'
}
