import * as d3 from 'd3-scale';
import { colorCssToRgb } from 'lib/helpers';
import { VECTOR_COLOR_MAPS } from '../../config/color-maps';

export const lineStyle = (zoom) => ({
  getLineWidth: 15,
  lineWidthUnit: 'meters',
  lineWidthMinPixels: 1,
  lineWidthMaxPixels: 5,
  lineJointRounded: true,
  lineCapRounded: true,

  // widthScale: 2 ** (15 - zoom),
});

export const pointRadius = (zoom) => ({
  getPointRadius: 20,
  pointRadiusUnit: 'meters',
  pointRadiusMinPixels: 3,
  pointRadiusMaxPixels: 10,
  // radiusScale: 2 ** (15 - zoom),
});

export interface ColorMapDefinition {
  colorScheme: string;
  colorField: string | Function;
}

export function colorMap(scale: (t: number, n?: number) => string, range: number[], empty: string) {
  const scaleFn = d3.scaleSequential<string>(range, scale);

  return (value) => (value == null ? empty : scaleFn(value));
}

function makeColorMap(definition: ColorMapDefinition) {
  const { colorScheme, colorField } = definition;
  const { scale, range, empty } = VECTOR_COLOR_MAPS[colorScheme];

  const accessorFn = typeof colorField === 'string' ? (f) => f.properties[colorField] : colorField;
  const colorFn = colorMap(scale, range, empty);

  return (f) => colorCssToRgb(colorFn(accessorFn(f)));
}

export function vectorColor(type: 'fill' | 'stroke', defaultValue, styleParams) {
  const prop = styleParams?.colorMap ? makeColorMap(styleParams.colorMap) : defaultValue;

  if (type === 'fill') return { getFillColor: prop, updateTriggers: { getFillColor: [styleParams] } };
  else if (type === 'stroke') return { getLineColor: prop, updateTriggers: { getLineColor: [styleParams] } };
}

export function border(color = [255, 255, 255]) {
  return {
    stroked: true,
    getLineColor: color,
    lineWidthMinPixels: 1,
  };
}
