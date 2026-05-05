const registry = new Map<string, HTMLElement>();

export function registerBillboard(id: string, el: HTMLElement): void {
  registry.set(id, el);
}

export function unregisterBillboard(id: string): void {
  registry.delete(id);
}

export function getRegisteredBillboards(): ReadonlyMap<string, HTMLElement> {
  return registry;
}
