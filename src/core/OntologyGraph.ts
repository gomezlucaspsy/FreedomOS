import { PopulationNode } from '../models/PopulationNode';
import { LocationNode } from '../models/LocationNode';
import { MigrationEventLog } from '../events/MigrationEventLog';
import type { MigrationEvent } from '../events/MigrationEventLog';

export class OntologyGraph {
  public populations: Map<string, PopulationNode> = new Map();
  public locations: Map<string, LocationNode> = new Map();
  public eventLog: MigrationEventLog = new MigrationEventLog();

  // In a real graph, edges represent semantic triplet links
  // [Population] -> [Migrates_To] -> [Location]
  public currentLocations: Map<string, string> = new Map(); // populationId -> locationId

  public addPopulation(pop: PopulationNode) {
    this.populations.set(pop.id, pop);
  }

  public addLocation(loc: LocationNode) {
    this.locations.set(loc.id, loc);
  }

  public setInitialLocation(populationId: string, locationId: string) {
    this.currentLocations.set(populationId, locationId);
  }

  public triggerMigration(populationId: string, targetLocationId: string, reason: MigrationEvent['reason']) {
    const pop = this.populations.get(populationId);
    const dest = this.locations.get(targetLocationId);
    const originId = this.currentLocations.get(populationId);

    if (!pop || !dest || !originId) {
      throw new Error("Invalid migration parameters. Triplet could not be formed.");
    }

    // 1. Log the movement event (Event Sourcing)
    this.eventLog.append({
      timestamp: new Date().toISOString(),
      populationId,
      fromLocationId: originId,
      toLocationId: targetLocationId,
      reason,
      impactScore: Math.random() * 10 
    });

    // 2. Update the semantic link
    this.currentLocations.set(populationId, targetLocationId);

    // 3. Mutate population traits based on migration shock
    pop.updateDemographics({
      culturalTraits: [...pop.demographics.culturalTraits, `influenced_by_${dest.name}`]
    });
  }

  public getFullProfile(populationId: string) {
    return {
      population: this.populations.get(populationId),
      currentLocation: this.locations.get(this.currentLocations.get(populationId) || ''),
      history: this.eventLog.getHistoryForPopulation(populationId)
    };
  }
}
