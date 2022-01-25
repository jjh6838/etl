// import { titleCase } from 'vega-lite';
import { makeConfig } from '../helpers';
import { COLORS } from './colors';

export interface LayerDefinition {
  deckLayer: string | { baseName: string; params: any };
  deckLayerParams?: any;
  label: string;
  dataUnit?: string;
  type: string; //'line' | 'circle' | 'raster' | 'polygon';
  color: string;
  id: string;
  getId?: (x) => string;
}

export function getHazardId<
  F extends string, //'fluvial' | 'surface' | 'coastal' | 'cyclone',
  RP extends number,
  RCP extends string,
  E extends number,
  C extends number | string,
>({
  hazardType,
  returnPeriod,
  rcp,
  epoch,
  confidence,
}: {
  hazardType: F;
  returnPeriod: RP;
  rcp: RCP;
  epoch: E;
  confidence: C;
}) {
  return `${hazardType}__rp_${returnPeriod}__rcp_${rcp}__epoch_${epoch}__conf_${confidence}` as const;
}

function hazardLayer<
  F extends 'fluvial' | 'surface' | 'coastal' | 'cyclone',
  RP extends number,
  RCP extends string,
  E extends number,
  C extends number | string,
>(label: string, hazardType: F, returnPeriod: RP, rcp: RCP, epoch: E, confidence: C) {
  const id = getHazardId({ hazardType, returnPeriod, rcp, epoch, confidence });
  return {
    id,
    deckLayer: { baseName: 'hazard', params: { hazardType, returnPeriod, rcp, epoch, confidence } },
    type: 'raster',
    label, //: `${titleCase(hazardType)}`,
    dataUnit: 'm',
    color: '#aaaaaa',
    getId: getHazardId,
  } as LayerDefinition & { id: typeof id };
}

/* Line widths:

-) elec_edges_high,
base: 1,
stops: [
  [7, 1],
  [12, 2],
  [16, 6],
],

-) elec_edges_low, pot_edges
base: 0.5,
stops: [
  [7, 0.5],
  [12, 1],
  [16, 3],
],

-) rail_edges
base: 1.5,
stops: [
  [7, 1.5],
  [12, 2],
  [16, 6],
],

-) road_edges
base: 0.5,
stops: [
  [7, 1.5],
  [12, 2],
  [16, 6],
],

-) all circle layers
base: 1.5,
stops: [
  [7, 3],
  [12, 4],
  [16, 12],
],

*/
export const LAYERS = makeConfig([
  {
    id: 'elec_edges_high',
    deckLayer: 'elec_edges_high',
    type: 'line',
    label: 'Power Lines (High Voltage)',
    color: COLORS.electricity_high.css,
  },
  {
    id: 'elec_edges_low',
    deckLayer: 'elec_edges_low',
    type: 'line',
    label: 'Power Lines (Low Voltage)',
    color: COLORS.electricity_low.css,
  },
  {
    id: 'elec_nodes_source',
    deckLayer: 'elec_nodes_source',
    type: 'circle',
    label: 'Power Nodes (Generation)',
    color: COLORS.electricity_high.css,
  },
  {
    id: 'elec_nodes_junction',
    deckLayer: 'elec_nodes_junction',
    type: 'circle',
    label: 'Power Nodes (Junctions)',
    color: COLORS.electricity_unknown.css,
  },
  {
    id: 'elec_nodes_sink',
    deckLayer: 'elec_nodes_sink',
    type: 'circle',
    label: 'Power Nodes (Demand)',
    color: COLORS.electricity_low.css,
  },
  {
    id: 'rail_edges',
    deckLayer: 'rail_edges',
    type: 'line',
    label: 'Railways',
    color: COLORS.railway.css,
  },
  {
    id: 'rail_nodes',
    deckLayer: 'rail_nodes',
    type: 'circle',
    label: 'Stations',
    color: COLORS.railway.css,
  },
  {
    id: 'road_edges',
    deckLayer: 'road_edges',
    type: 'line',
    label: 'Roads',
    color: COLORS.roads_unknown.css,
  },
  {
    id: 'road_bridges',
    deckLayer: 'road_bridges',
    type: 'circle',
    label: 'Bridges',
    color: COLORS.bridges.css,
  },
  {
    id: 'airport_areas',
    deckLayer: 'airport_areas',
    type: 'polygon',
    label: 'Airports',
    color: COLORS.airports.css,
  },
  {
    id: 'port_areas',
    deckLayer: 'port_areas',
    type: 'polygon',
    label: 'Ports',
    color: COLORS.ports.css,
  },
  {
    id: 'water_potable_edges',
    deckLayer: 'water_potable_edges',
    type: 'line',
    label: 'Water Supply Pipelines',
    color: COLORS.water_supply.css,
  },
  {
    id: 'water_potable_nodes',
    deckLayer: 'water_potable_nodes',
    type: 'circle',
    label: 'Water Supply Facilities',
    color: COLORS.water_supply.css,
  },
  {
    id: 'water_irrigation_edges',
    deckLayer: 'water_irrigation_edges',
    type: 'line',
    label: 'Irrigation Canals',
    color: COLORS.water_irrigation.css,
  },
  {
    id: 'water_irrigation_nodes',
    deckLayer: 'water_irrigation_nodes',
    type: 'circle',
    label: 'Irrigation facilities',
    color: COLORS.water_irrigation.css,
  },
  {
    id: 'water_waste_edges',
    deckLayer: 'water_waste_edges',
    type: 'line',
    label: 'Wastewater Pipelines',
    color: COLORS.water_wastewater.css,
  },
  {
    id: 'water_waste_nodes',
    deckLayer: 'water_waste_nodes',
    type: 'circle',
    label: 'Wastewater Facilities',
    color: COLORS.water_wastewater.css,
  },

  hazardLayer('River Flooding', 'fluvial', 20, 'baseline', 2010, 'None'),
  hazardLayer('River Flooding', 'fluvial', 50, 'baseline', 2010, 'None'),
  hazardLayer('River Flooding', 'fluvial', 100, 'baseline', 2010, 'None'),
  hazardLayer('River Flooding', 'fluvial', 200, 'baseline', 2010, 'None'),
  hazardLayer('River Flooding', 'fluvial', 500, 'baseline', 2010, 'None'),
  hazardLayer('River Flooding', 'fluvial', 1500, 'baseline', 2010, 'None'),

  hazardLayer('Surface Flooding', 'surface', 20, 'baseline', 2010, 'None'),
  hazardLayer('Surface Flooding', 'surface', 50, 'baseline', 2010, 'None'),
  hazardLayer('Surface Flooding', 'surface', 100, 'baseline', 2010, 'None'),
  hazardLayer('Surface Flooding', 'surface', 200, 'baseline', 2010, 'None'),
  hazardLayer('Surface Flooding', 'surface', 500, 'baseline', 2010, 'None'),
  hazardLayer('Surface Flooding', 'surface', 1500, 'baseline', 2010, 'None'),

  hazardLayer('Coastal Flooding', 'coastal', 1, '2.6', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '2.6', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '2.6', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '2.6', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '2.6', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '2.6', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '2.6', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '2.6', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '2.6', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '2.6', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '2.6', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '2.6', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, 'baseline', 2010, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, 'baseline', 2010, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, 'baseline', 2010, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, 'baseline', 2010, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, 'baseline', 2010, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, 'baseline', 2010, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '4.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '4.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '4.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '4.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '4.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '4.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '4.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '4.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '4.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '4.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '4.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '4.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '4.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '4.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '4.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '4.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '4.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '4.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '4.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '4.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '4.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '4.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '4.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '4.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '8.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '8.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '8.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '8.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '8.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '8.5', 2030, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '8.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '8.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '8.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '8.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '8.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '8.5', 2050, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '8.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '8.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '8.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '8.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '8.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '8.5', 2070, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 1, '8.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 2, '8.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 5, '8.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 10, '8.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 50, '8.5', 2100, 'None'),
  hazardLayer('Coastal Flooding', 'coastal', 100, '8.5', 2100, 'None'),

  hazardLayer('Cyclone', 'cyclone', 10, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 10, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 10, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 20, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 20, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 20, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 30, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 30, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 30, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 40, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 40, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 40, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 50, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 50, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 50, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 60, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 60, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 60, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 70, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 70, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 70, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 80, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 80, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 80, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 90, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 90, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 90, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 100, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 100, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 100, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 200, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 200, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 200, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 300, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 300, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 300, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 400, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 400, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 400, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 500, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 500, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 500, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 600, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 600, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 600, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 700, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 700, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 700, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 800, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 800, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 800, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 900, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 900, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 900, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 1000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 1000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 1000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 2000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 2000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 2000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 3000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 3000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 3000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 4000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 4000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 4000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 5000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 5000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 5000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 6000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 6000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 6000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 7000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 7000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 7000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 8000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 8000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 8000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 9000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 9000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 9000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 10000, '4.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 10000, '4.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 10000, '4.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 10, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 10, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 10, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 20, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 20, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 20, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 30, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 30, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 30, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 40, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 40, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 40, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 50, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 50, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 50, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 60, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 60, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 60, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 70, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 70, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 70, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 80, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 80, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 80, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 90, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 90, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 90, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 100, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 100, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 100, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 200, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 200, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 200, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 300, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 300, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 300, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 400, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 400, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 400, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 500, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 500, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 500, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 600, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 600, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 600, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 700, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 700, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 700, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 800, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 800, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 800, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 900, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 900, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 900, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 1000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 1000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 1000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 2000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 2000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 2000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 3000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 3000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 3000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 4000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 4000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 4000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 5000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 5000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 5000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 6000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 6000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 6000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 7000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 7000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 7000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 8000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 8000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 8000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 9000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 9000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 9000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 10000, '4.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 10000, '4.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 10000, '4.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 10, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 10, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 10, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 20, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 20, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 20, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 30, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 30, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 30, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 40, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 40, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 40, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 50, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 50, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 50, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 60, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 60, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 60, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 70, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 70, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 70, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 80, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 80, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 80, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 90, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 90, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 90, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 100, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 100, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 100, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 200, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 200, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 200, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 300, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 300, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 300, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 400, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 400, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 400, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 500, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 500, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 500, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 600, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 600, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 600, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 700, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 700, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 700, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 800, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 800, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 800, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 900, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 900, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 900, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 1000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 1000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 1000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 2000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 2000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 2000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 3000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 3000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 3000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 4000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 4000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 4000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 5000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 5000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 5000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 6000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 6000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 6000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 7000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 7000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 7000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 8000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 8000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 8000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 9000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 9000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 9000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 10000, '8.5', 2050, 5),
  hazardLayer('Cyclone', 'cyclone', 10000, '8.5', 2050, 50),
  hazardLayer('Cyclone', 'cyclone', 10000, '8.5', 2050, 95),
  hazardLayer('Cyclone', 'cyclone', 10, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 10, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 10, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 20, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 20, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 20, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 30, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 30, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 30, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 40, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 40, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 40, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 50, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 50, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 50, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 60, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 60, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 60, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 70, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 70, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 70, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 80, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 80, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 80, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 90, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 90, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 90, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 100, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 100, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 100, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 200, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 200, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 200, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 300, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 300, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 300, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 400, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 400, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 400, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 500, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 500, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 500, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 600, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 600, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 600, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 700, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 700, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 700, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 800, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 800, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 800, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 900, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 900, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 900, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 1000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 1000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 1000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 2000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 2000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 2000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 3000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 3000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 3000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 4000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 4000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 4000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 5000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 5000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 5000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 6000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 6000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 6000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 7000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 7000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 7000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 8000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 8000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 8000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 9000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 9000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 9000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 10000, '8.5', 2100, 5),
  hazardLayer('Cyclone', 'cyclone', 10000, '8.5', 2100, 50),
  hazardLayer('Cyclone', 'cyclone', 10000, '8.5', 2100, 95),
  hazardLayer('Cyclone', 'cyclone', 10, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 10, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 10, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 20, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 20, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 20, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 30, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 30, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 30, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 40, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 40, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 40, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 50, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 50, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 50, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 60, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 60, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 60, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 70, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 70, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 70, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 80, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 80, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 80, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 90, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 90, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 90, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 100, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 100, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 100, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 200, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 200, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 200, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 300, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 300, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 300, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 400, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 400, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 400, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 500, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 500, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 500, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 600, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 600, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 600, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 700, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 700, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 700, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 800, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 800, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 800, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 900, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 900, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 900, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 1000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 1000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 1000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 2000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 2000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 2000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 3000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 3000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 3000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 4000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 4000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 4000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 5000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 5000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 5000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 6000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 6000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 6000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 7000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 7000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 7000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 8000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 8000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 8000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 9000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 9000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 9000, 'baseline', 2010, 95),
  hazardLayer('Cyclone', 'cyclone', 10000, 'baseline', 2010, 5),
  hazardLayer('Cyclone', 'cyclone', 10000, 'baseline', 2010, 50),
  hazardLayer('Cyclone', 'cyclone', 10000, 'baseline', 2010, 95),
]);

export type LayerName = keyof typeof LAYERS;
