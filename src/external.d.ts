declare module 'globby' {
  function globby(globExpressions: string[]): Promise<string[]>;
  export = globby;
}

declare module 'execa' {
  import { ChildProcess } from 'child_process';
  function execa(name: string, arguments: string[]): Promise<ChildProcess>;
  export = execa;
}
