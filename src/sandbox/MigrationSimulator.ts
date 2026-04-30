import { OntologyGraph } from '../core/OntologyGraph';
import { PopulationNode } from '../models/PopulationNode';
import { LocationNode } from '../models/LocationNode';

export const runSimulation = (graph: OntologyGraph) => {
  // 1. Define Nodes
  const popA = new PopulationNode('pop_group_syria', 'Sirios Refugiados Cohorte A', {
    size: 5000,
    economicStatus: 'low',
    culturalTraits: ['Arabic', 'Resilient_Community']
  });

  const locOrigin = new LocationNode('loc_syria', 'Alepo, Siria', 'origin');
  const locTransit = new LocationNode('loc_turkey', 'Frontera Turca', 'transit');
  const locDest = new LocationNode('loc_germany', 'Berlin, Alemania', 'destination');

  // 2. Add to Graph
  graph.addPopulation(popA);
  graph.addLocation(locOrigin);
  graph.addLocation(locTransit);
  graph.addLocation(locDest);

  // 3. Establish initial ontology link
  graph.setInitialLocation('pop_group_syria', 'loc_syria');

  // 4. Simulate the "Chain of Signifiers" mapping over time
  // Migration Event 1
  graph.triggerMigration('pop_group_syria', 'loc_turkey', 'conflict');
  
  // Migration Event 2
  graph.triggerMigration('pop_group_syria', 'loc_germany', 'economic');

  // Return the "chained" structured profile
  return graph.getFullProfile('pop_group_syria');
};
