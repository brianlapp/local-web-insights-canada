declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> {
    (this: T, ...args: Y): any;
    mockImplementation(fn: (...args: Y) => any): Mock<T, Y>;
    mockReturnValue(value: any): Mock<T, Y>;
    mockResolvedValue(value: any): Mock<T, Y>;
    mockRejectedValue(value: any): Mock<T, Y>;
  }

  function fn<T = any, Y extends any[] = any>(implementation?: (...args: Y) => T): Mock<T, Y>;
  function mock(moduleName: string, factory?: () => any): void;
} 