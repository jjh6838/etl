import { MVTLayer } from 'deck.gl';

import { border } from 'lib/deck-layers/utils';

import { BackgroundName } from '../backgrounds';
import { BoundaryLevel, REGIONS_METADATA } from './metadata';

export function boundariesDeckLayer(level: BoundaryLevel) {
  return new MVTLayer(
    {
      id: `boundaries_${level}`,
      data: `/vector/data/regions_${level}.json`,
      binary: true,
      filled: true,
      getFillColor: [255, 255, 255, 0],
      pickable: true,
      stroked: true,
      refinementStrategy: 'best-available',
      lineWidthUnits: 'pixels',
    } as any,
    border([150, 150, 150, 255]) as any,
  );
}

const LIGHT_TEXT = [240, 240, 240, 255];
const DARK_TEXT = [90, 90, 90, 255];

export function boundaryLabelsLayer(level: BoundaryLevel, background: BackgroundName) {
  const config = REGIONS_METADATA[level];

  const color = background === 'satellite' ? LIGHT_TEXT : DARK_TEXT;
  return (
    config.showLabels &&
    new MVTLayer({
      id: `boundaries_${level}-text`,
      data: `/vector/data/regions_${level}_labels.json`,
      loadOptions: {
        mvt: {
          layers: ['labels'],
        },
      },
      binary: false,
      minZoom: config.minZoom,
      pointType: 'text',
      getText: (f) => f.properties[config.fieldName],
      getTextSize: 24,
      getTextColor: color,
      textFontFamily: 'Arial',
      textFontWeight: 'bold',
      getPolygonOffset: ({ layerIndex }) => [0, -layerIndex * 100 - 2000],

      // won't work before deck.gl v8.7.0 is released (textFontSettings isn't mapped correctly)
      // see https://github.com/visgl/deck.gl/pull/6336
      //
      // textOutlineColor: [255, 255, 255, 255],
      // textOutlineWidth: 1,
      // textFontSettings: {
      //   sdf: true,
      // },
    } as any)
  );
}
