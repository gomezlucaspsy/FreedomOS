export class LocationNode {
  public readonly id: string;
  public readonly name: string;
  public readonly type: 'origin' | 'transit' | 'destination';
  public readonly capacity: number;
  public currentLoad: number;

  constructor(id: string, name: string, type: 'origin' | 'transit' | 'destination', capacity: number = Infinity) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.capacity = capacity;
    this.currentLoad = 0;
  }
}
