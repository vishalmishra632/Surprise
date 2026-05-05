const registry = new Map<string, HTMLElement>();

export function registerLandmark(id: string, el: HTMLElement): void {
  registry.set(id, el);
}

export function unregisterLandmark(id: string): void {
  registry.delete(id);
}

export function getRegisteredLandmarks(): ReadonlyMap<string, HTMLElement> {
  return registry;
}
