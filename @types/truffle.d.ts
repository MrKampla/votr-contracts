type ContractTestDeclaration = (name: string, cb: (accounts: string[]) => void) => void;

export declare global {
  const artifacts: Artifacts;
  const assert: Chai.AssertStatic;
  const contract: ContractTestDeclaration;
}

export interface Artifacts {
  require(name: string): any;
}
