export interface Demographics {
  size: number;
  economicStatus: 'low' | 'medium' | 'high';
  culturalTraits: string[];
}

export class PopulationNode {
  public readonly id: string;
  public readonly name: string;
  public demographics: Demographics;

  constructor(id: string, name: string, demographics: Demographics) {
    this.id = id;
    this.name = name;
    // We clone to ensure immutability at instantiation
    this.demographics = { ...demographics };
  }

  public updateDemographics(partial: Partial<Demographics>) {
    this.demographics = { ...this.demographics, ...partial };
  }
}
