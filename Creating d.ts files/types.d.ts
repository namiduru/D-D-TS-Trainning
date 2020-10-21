// You could define types
export type SumArgs = {
  firstArgument: number;
  secondArgument: number;
}

// Will Throw Error
// const foo = "bar";

// You can't add body, it is function type definition
export function multiplyNumbers(x: number, y: number): number;