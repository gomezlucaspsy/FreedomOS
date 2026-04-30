export type MigrationReason = 'conflict' | 'economic' | 'social_network' | 'climate';

export interface MigrationEvent {
  timestamp: string;
  populationId: string;
  fromLocationId: string;
  toLocationId: string;
  reason: MigrationReason;
  impactScore: number;
}

export class MigrationEventLog {
  private events: MigrationEvent[] = [];

  public append(event: MigrationEvent) {
    this.events.push({ ...event, timestamp: event.timestamp || new Date().toISOString() });
  }

  public getHistoryForPopulation(populationId: string): MigrationEvent[] {
    return this.events.filter(e => e.populationId === populationId);
  }

  public getAllEvents(): MigrationEvent[] {
    return [...this.events];
  }
}
