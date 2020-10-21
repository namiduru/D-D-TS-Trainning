import {SumArgs} from './types';

export let someStringVar: string = String(9);

export function sum({firstArgument, secondArgument}: SumArgs) {
  return firstArgument + secondArgument;
}

sum({firstArgument: 1, secondArgument: 2});