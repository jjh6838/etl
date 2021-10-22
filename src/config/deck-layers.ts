import { MVTLayer, TileLayer, BitmapLayer, GeoJsonLayer } from 'deck.gl';
import GL from '@luma.gl/constants';
import { rgb } from 'd3-color';
import * as d3 from 'd3-scale';

import { COLORS } from './colors';
import { colorCssToRgb, makeConfig } from '../helpers';
import { getHazardId } from './layers';
import { RASTER_COLOR_MAPS, VECTOR_COLOR_MAPS } from './color-maps';

const lineStyle = (zoom) => ({
  getLineWidth: 15,
  lineWidthUnit: 'meters',
  lineWidthMinPixels: 1,
  lineWidthMaxPixels: 5,
  lineJointRounded: true,
  lineCapRounded: true,

  // widthScale: 2 ** (15 - zoom),
});

const pointRadius = (zoom) => ({
  getPointRadius: 20,
  pointRadiusUnit: 'meters',
  pointRadiusMinPixels: 3,
  pointRadiusMaxPixels: 10,
  // radiusScale: 2 ** (15 - zoom),
});

enum RoadClass {
  class_a = 'class_a',
  class_b = 'class_b',
  class_c = 'class_c',
  metro = 'metro',
  other = 'other',
  track = 'track',
}

const roadClassLookup = {
  'CLASS A': RoadClass.class_a,
  'CLASS B': RoadClass.class_b,
  'CLASS C': RoadClass.class_c,
  METRO: RoadClass.metro,
  TRACK: RoadClass.track,
  OTHER: RoadClass.other,
};

const roadColor = {
  [RoadClass.class_a]: COLORS.roads_class_a.deck,
  [RoadClass.class_b]: COLORS.roads_class_b.deck,
  [RoadClass.class_c]: COLORS.roads_class_c.deck,
  [RoadClass.metro]: COLORS.roads_class_metro.deck,
  [RoadClass.track]: COLORS.roads_unknown.deck,
  [RoadClass.other]: COLORS.roads_unknown.deck,
};

function infrastructureLayer(...props) {
  return new MVTLayer(
    {
      binary: true,
      autoHighlight: true,
      highlightColor: [0, 255, 255, 255],
      refinementStrategy: 'best-available',
    } as any,
    ...props,
  );
}

interface ColorMapDefinition {
  colorScheme: string;
  colorField: string;
}

// function lineColor(colorMapFn) {

// }

// function pointColor(colorMapFn) {

// }
function makeColorMap(definition: ColorMapDefinition) {
  const { colorScheme, colorField } = definition;
  const { scale, range, empty } = VECTOR_COLOR_MAPS[colorScheme];

  const scaleFn = d3.scaleSequential(range, scale);

  return (f) => {
    const value = f.properties[colorField];
    return colorCssToRgb(value == null || value === 0 ? empty : scaleFn(value));
  };
}

function vectorColor(type: 'fill' | 'stroke', defaultValue, styleParams) {
  const prop = styleParams?.colorMap ? makeColorMap(styleParams.colorMap) : defaultValue;

  if (type === 'fill') return { getFillColor: prop, updateTriggers: { getFillColor: [styleParams] } };
  else if (type === 'stroke') return { getLineColor: prop, updateTriggers: { getLineColor: [styleParams] } };
}

function border(color = [255, 255, 255]) {
  return {
    stroked: true,
    getLineColor: color,
    lineWidthMinPixels: 1,
  };
}

export function selectionLayer(feature, zoom) {
  return new GeoJsonLayer(
    {
      id: 'selection',
      data: [feature],
      getFillColor: [0, 255, 255],
      getLineColor: [0, 255, 255],
      pickable: false,
    },
    lineStyle(zoom),
    pointRadius(zoom),
  );
}

export const DECK_LAYERS = makeConfig<any, string>([
  {
    id: 'elec_edges_high',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/elec_edges_high.json',
        },
        vectorColor('stroke', COLORS.electricity_high.deck, styleParams),
        lineStyle(zoom),
      ),
  },
  {
    id: 'elec_edges_low',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/elec_edges_low.json',
        },
        vectorColor('stroke', COLORS.electricity_low.deck, styleParams),
        lineStyle(zoom),
      ),
  },
  {
    id: 'elec_nodes_source',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/elec_nodes_source.json',
        },
        border(),
        vectorColor('fill', COLORS.electricity_high.deck, styleParams),
        pointRadius(zoom),
      ),
  },
  {
    id: 'elec_nodes_sink',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/elec_nodes_sink.json',
        },
        border(),
        vectorColor('fill', COLORS.electricity_low.deck, styleParams),
        pointRadius(zoom),
      ),
  },
  {
    id: 'elec_nodes_junction',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/elec_nodes_junction.json',
        },
        border(),
        vectorColor('fill', COLORS.electricity_unknown.deck, styleParams),
        pointRadius(zoom),
      ),
  },
  {
    id: 'rail_edges',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/rail_edges.json',
        },
        vectorColor('stroke', COLORS.railway.deck, styleParams),
        lineStyle(zoom),
      ),
  },
  {
    id: 'rail_nodes',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/rail_nodes.json',
        },
        border(),
        vectorColor('fill', COLORS.railway.deck, styleParams),
        pointRadius(zoom),
      ),
  },
  {
    id: 'road_edges',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/road_edges.json',
        },
        vectorColor('stroke', (x) => roadColor[roadClassLookup[x.properties.road_class]], styleParams),
        lineStyle(zoom),
      ),
  },
  {
    id: 'road_bridges',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/road_bridges.json',
        },
        border(),
        vectorColor('fill', COLORS.bridges.deck, styleParams),
        pointRadius(zoom),
      ),
  },
  {
    id: 'airport_areas',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/airport_areas.json',
        },
        border([0, 0, 0]),
        vectorColor('fill', COLORS.airports.deck, styleParams),
      ),
  },
  {
    id: 'port_areas',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/port_areas.json',
        },
        border(),
        vectorColor('fill', COLORS.ports.deck, styleParams),
      ),
  },
  {
    id: 'water_potable_edges',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/water_potable_edges.json',
        },
        lineStyle(zoom),
        vectorColor('stroke', COLORS.water_edges.deck, styleParams),
      ),
  },
  {
    id: 'water_potable_nodes',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/water_potable_nodes.json',
        },
        border(),
        pointRadius(zoom),
        vectorColor('fill', COLORS.water_abstraction.deck, styleParams),
      ),
  },
  {
    id: 'water_irrigation_edges',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/water_irrigation_edges.json',
        },
        lineStyle(zoom),
        vectorColor('stroke', COLORS.water_edges.deck, styleParams),
      ),
  },
  {
    id: 'water_irrigation_nodes',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/water_irrigation_nodes.json',
        },
        border(),
        pointRadius(zoom),
        vectorColor('fill', COLORS.water_abstraction.deck, styleParams),
      ),
  },
  {
    id: 'water_waste_edges',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/water_waste_edges.json',
        },
        lineStyle(zoom),

        vectorColor('stroke', COLORS.water_edges.deck, styleParams),
      ),
  },
  {
    id: 'water_waste_nodes',
    spatialType: 'vector',
    fn: ({ props, zoom, styleParams }) =>
      infrastructureLayer(
        props,
        {
          data: '/vector/data/water_waste_nodes.json',
        },
        border(),
        pointRadius(zoom),
        vectorColor('fill', COLORS.water_abstraction.deck, styleParams),
      ),
  },

  hazardDeckLayer('fluvial', 20, 'baseline', 2010, 'None'),
  hazardDeckLayer('fluvial', 50, 'baseline', 2010, 'None'),
  hazardDeckLayer('fluvial', 100, 'baseline', 2010, 'None'),
  hazardDeckLayer('fluvial', 200, 'baseline', 2010, 'None'),
  hazardDeckLayer('fluvial', 500, 'baseline', 2010, 'None'),
  hazardDeckLayer('fluvial', 1500, 'baseline', 2010, 'None'),

  hazardDeckLayer('surface', 20, 'baseline', 2010, 'None'),
  hazardDeckLayer('surface', 50, 'baseline', 2010, 'None'),
  hazardDeckLayer('surface', 100, 'baseline', 2010, 'None'),
  hazardDeckLayer('surface', 200, 'baseline', 2010, 'None'),
  hazardDeckLayer('surface', 500, 'baseline', 2010, 'None'),
  hazardDeckLayer('surface', 1500, 'baseline', 2010, 'None'),

  hazardDeckLayer('coastal', 1, '2x6', 2050, 'None'),
  hazardDeckLayer('coastal', 2, '2x6', 2050, 'None'),
  hazardDeckLayer('coastal', 5, '2x6', 2050, 'None'),
  hazardDeckLayer('coastal', 10, '2x6', 2050, 'None'),
  hazardDeckLayer('coastal', 50, '2x6', 2050, 'None'),
  hazardDeckLayer('coastal', 100, '2x6', 2050, 'None'),
  hazardDeckLayer('coastal', 1, '2x6', 2100, 'None'),
  hazardDeckLayer('coastal', 2, '2x6', 2100, 'None'),
  hazardDeckLayer('coastal', 5, '2x6', 2100, 'None'),
  hazardDeckLayer('coastal', 10, '2x6', 2100, 'None'),
  hazardDeckLayer('coastal', 50, '2x6', 2100, 'None'),
  hazardDeckLayer('coastal', 100, '2x6', 2100, 'None'),
  hazardDeckLayer('coastal', 1, 'baseline', 2010, 'None'),
  hazardDeckLayer('coastal', 2, 'baseline', 2010, 'None'),
  hazardDeckLayer('coastal', 5, 'baseline', 2010, 'None'),
  hazardDeckLayer('coastal', 10, 'baseline', 2010, 'None'),
  hazardDeckLayer('coastal', 50, 'baseline', 2010, 'None'),
  hazardDeckLayer('coastal', 100, 'baseline', 2010, 'None'),
  hazardDeckLayer('coastal', 1, '4x5', 2030, 'None'),
  hazardDeckLayer('coastal', 2, '4x5', 2030, 'None'),
  hazardDeckLayer('coastal', 5, '4x5', 2030, 'None'),
  hazardDeckLayer('coastal', 10, '4x5', 2030, 'None'),
  hazardDeckLayer('coastal', 50, '4x5', 2030, 'None'),
  hazardDeckLayer('coastal', 100, '4x5', 2030, 'None'),
  hazardDeckLayer('coastal', 1, '4x5', 2050, 'None'),
  hazardDeckLayer('coastal', 2, '4x5', 2050, 'None'),
  hazardDeckLayer('coastal', 5, '4x5', 2050, 'None'),
  hazardDeckLayer('coastal', 10, '4x5', 2050, 'None'),
  hazardDeckLayer('coastal', 50, '4x5', 2050, 'None'),
  hazardDeckLayer('coastal', 100, '4x5', 2050, 'None'),
  hazardDeckLayer('coastal', 1, '4x5', 2070, 'None'),
  hazardDeckLayer('coastal', 2, '4x5', 2070, 'None'),
  hazardDeckLayer('coastal', 5, '4x5', 2070, 'None'),
  hazardDeckLayer('coastal', 10, '4x5', 2070, 'None'),
  hazardDeckLayer('coastal', 50, '4x5', 2070, 'None'),
  hazardDeckLayer('coastal', 100, '4x5', 2070, 'None'),
  hazardDeckLayer('coastal', 1, '4x5', 2100, 'None'),
  hazardDeckLayer('coastal', 2, '4x5', 2100, 'None'),
  hazardDeckLayer('coastal', 5, '4x5', 2100, 'None'),
  hazardDeckLayer('coastal', 10, '4x5', 2100, 'None'),
  hazardDeckLayer('coastal', 50, '4x5', 2100, 'None'),
  hazardDeckLayer('coastal', 100, '4x5', 2100, 'None'),
  hazardDeckLayer('coastal', 1, '8x5', 2030, 'None'),
  hazardDeckLayer('coastal', 2, '8x5', 2030, 'None'),
  hazardDeckLayer('coastal', 5, '8x5', 2030, 'None'),
  hazardDeckLayer('coastal', 10, '8x5', 2030, 'None'),
  hazardDeckLayer('coastal', 50, '8x5', 2030, 'None'),
  hazardDeckLayer('coastal', 100, '8x5', 2030, 'None'),
  hazardDeckLayer('coastal', 1, '8x5', 2050, 'None'),
  hazardDeckLayer('coastal', 2, '8x5', 2050, 'None'),
  hazardDeckLayer('coastal', 5, '8x5', 2050, 'None'),
  hazardDeckLayer('coastal', 10, '8x5', 2050, 'None'),
  hazardDeckLayer('coastal', 50, '8x5', 2050, 'None'),
  hazardDeckLayer('coastal', 100, '8x5', 2050, 'None'),
  hazardDeckLayer('coastal', 1, '8x5', 2070, 'None'),
  hazardDeckLayer('coastal', 2, '8x5', 2070, 'None'),
  hazardDeckLayer('coastal', 5, '8x5', 2070, 'None'),
  hazardDeckLayer('coastal', 10, '8x5', 2070, 'None'),
  hazardDeckLayer('coastal', 50, '8x5', 2070, 'None'),
  hazardDeckLayer('coastal', 100, '8x5', 2070, 'None'),
  hazardDeckLayer('coastal', 1, '8x5', 2100, 'None'),
  hazardDeckLayer('coastal', 2, '8x5', 2100, 'None'),
  hazardDeckLayer('coastal', 5, '8x5', 2100, 'None'),
  hazardDeckLayer('coastal', 10, '8x5', 2100, 'None'),
  hazardDeckLayer('coastal', 50, '8x5', 2100, 'None'),
  hazardDeckLayer('coastal', 100, '8x5', 2100, 'None'),

  hazardDeckLayer('cyclone', 10, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 10, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 10, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 20, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 20, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 20, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 30, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 30, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 30, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 40, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 40, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 40, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 50, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 50, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 50, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 60, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 60, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 60, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 70, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 70, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 70, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 80, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 80, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 80, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 90, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 90, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 90, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 100, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 100, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 100, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 200, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 200, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 200, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 300, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 300, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 300, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 400, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 400, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 400, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 500, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 500, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 500, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 600, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 600, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 600, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 700, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 700, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 700, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 800, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 800, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 800, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 900, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 900, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 900, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 1000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 1000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 1000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 2000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 2000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 2000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 3000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 3000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 3000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 4000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 4000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 4000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 5000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 5000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 5000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 6000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 6000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 6000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 7000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 7000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 7000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 8000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 8000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 8000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 9000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 9000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 9000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 10000, '4x5', 2050, 5),
  hazardDeckLayer('cyclone', 10000, '4x5', 2050, 50),
  hazardDeckLayer('cyclone', 10000, '4x5', 2050, 95),
  hazardDeckLayer('cyclone', 10, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 10, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 10, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 20, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 20, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 20, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 30, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 30, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 30, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 40, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 40, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 40, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 50, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 50, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 50, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 60, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 60, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 60, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 70, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 70, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 70, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 80, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 80, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 80, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 90, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 90, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 90, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 100, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 100, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 100, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 200, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 200, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 200, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 300, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 300, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 300, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 400, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 400, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 400, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 500, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 500, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 500, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 600, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 600, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 600, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 700, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 700, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 700, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 800, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 800, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 800, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 900, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 900, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 900, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 1000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 1000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 1000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 2000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 2000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 2000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 3000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 3000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 3000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 4000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 4000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 4000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 5000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 5000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 5000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 6000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 6000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 6000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 7000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 7000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 7000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 8000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 8000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 8000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 9000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 9000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 9000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 10000, '4x5', 2100, 5),
  hazardDeckLayer('cyclone', 10000, '4x5', 2100, 50),
  hazardDeckLayer('cyclone', 10000, '4x5', 2100, 95),
  hazardDeckLayer('cyclone', 10, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 10, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 10, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 20, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 20, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 20, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 30, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 30, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 30, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 40, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 40, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 40, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 50, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 50, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 50, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 60, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 60, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 60, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 70, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 70, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 70, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 80, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 80, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 80, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 90, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 90, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 90, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 100, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 100, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 100, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 200, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 200, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 200, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 300, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 300, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 300, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 400, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 400, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 400, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 500, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 500, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 500, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 600, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 600, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 600, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 700, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 700, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 700, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 800, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 800, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 800, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 900, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 900, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 900, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 1000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 1000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 1000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 2000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 2000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 2000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 3000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 3000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 3000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 4000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 4000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 4000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 5000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 5000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 5000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 6000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 6000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 6000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 7000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 7000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 7000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 8000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 8000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 8000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 9000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 9000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 9000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 10000, '8x5', 2050, 5),
  hazardDeckLayer('cyclone', 10000, '8x5', 2050, 50),
  hazardDeckLayer('cyclone', 10000, '8x5', 2050, 95),
  hazardDeckLayer('cyclone', 10, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 10, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 10, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 20, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 20, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 20, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 30, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 30, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 30, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 40, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 40, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 40, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 50, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 50, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 50, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 60, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 60, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 60, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 70, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 70, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 70, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 80, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 80, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 80, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 90, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 90, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 90, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 100, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 100, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 100, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 200, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 200, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 200, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 300, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 300, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 300, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 400, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 400, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 400, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 500, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 500, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 500, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 600, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 600, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 600, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 700, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 700, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 700, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 800, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 800, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 800, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 900, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 900, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 900, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 1000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 1000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 1000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 2000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 2000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 2000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 3000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 3000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 3000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 4000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 4000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 4000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 5000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 5000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 5000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 6000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 6000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 6000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 7000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 7000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 7000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 8000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 8000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 8000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 9000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 9000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 9000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 10000, '8x5', 2100, 5),
  hazardDeckLayer('cyclone', 10000, '8x5', 2100, 50),
  hazardDeckLayer('cyclone', 10000, '8x5', 2100, 95),
  hazardDeckLayer('cyclone', 10, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 10, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 10, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 20, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 20, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 20, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 30, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 30, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 30, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 40, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 40, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 40, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 50, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 50, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 50, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 60, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 60, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 60, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 70, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 70, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 70, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 80, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 80, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 80, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 90, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 90, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 90, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 100, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 100, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 100, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 200, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 200, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 200, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 300, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 300, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 300, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 400, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 400, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 400, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 500, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 500, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 500, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 600, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 600, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 600, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 700, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 700, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 700, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 800, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 800, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 800, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 900, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 900, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 900, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 1000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 1000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 1000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 2000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 2000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 2000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 3000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 3000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 3000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 4000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 4000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 4000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 5000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 5000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 5000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 6000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 6000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 6000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 7000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 7000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 7000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 8000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 8000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 8000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 9000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 9000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 9000, 'baseline', 2010, 95),
  hazardDeckLayer('cyclone', 10000, 'baseline', 2010, 5),
  hazardDeckLayer('cyclone', 10000, 'baseline', 2010, 50),
  hazardDeckLayer('cyclone', 10000, 'baseline', 2010, 95),
]);

function hazardDeckLayer(hazardType, returnPeriod, rcp, epoch, confidence) {
  const id = getHazardId({ hazardType, returnPeriod, rcp, epoch, confidence }); //`hazard_${hazardType}_${returnPeriod}`;

  const magFilter = hazardType === 'cyclone' ? GL.NEAREST : GL.LINEAR;
  const refinementStrategy = hazardType === 'cyclone' ? 'best-available' : 'no-overlap';

  return {
    id,
    spatialType: 'raster',
    fn: ({ props, zoom, params: { hazardType, returnPeriod, rcp, epoch, confidence } }) => {
      const { scheme, range } = RASTER_COLOR_MAPS[hazardType];

      return rasterTileLayer(
        {
          textureParameters: {
            [GL.TEXTURE_MAG_FILTER]: magFilter,
            // [GL.TEXTURE_MAG_FILTER]: zoom < 12 ? GL.NEAREST : GL.NEAREST_MIPMAP_LINEAR,
          },
        },
        props,
        {
          id,
          data: `/raster/singleband/${hazardType}/${returnPeriod}/${rcp}/${epoch}/${confidence}/{z}/{x}/{y}.png?colormap=${scheme}&stretch_range=[${range[0]},${range[1]}]`,
          refinementStrategy,
        },
      );
    },
  };
}

function getBoundsForTile(tileProps) {
  const {
    bbox: { west, south, east, north },
  } = tileProps;

  return [west, south, east, north];
}

function rasterTileLayer(bitmapProps, ...props) {
  return new TileLayer(...props, {
    renderSubLayers: (tileProps) =>
      new BitmapLayer(
        tileProps,
        {
          data: null,
          image: tileProps.data,
          bounds: getBoundsForTile(tileProps.tile),
        },
        bitmapProps,
      ),
  });
}
