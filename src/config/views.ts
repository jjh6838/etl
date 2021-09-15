export const views = {
  overview: {
    layers: [
      'elec_edges_high',
      'elec_edges_low',
      'elec_nodes',
      'rail_edges',
      'rail_nodes',
      'road_edges',
      'bridges',
      'pot_edges',
      'abs_nodes',
    ],
  },
  hazards: {
    layers: [
      'flood_fluvial_20',
      'flood_fluvial_50',
      'flood_fluvial_100',
      'flood_fluvial_200',
      'flood_fluvial_500',
      'flood_fluvial_1500',
    ],
  },
};

export type ViewName = keyof typeof views;
