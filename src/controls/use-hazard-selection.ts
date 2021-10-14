import { useCallback, useMemo, useState } from 'react';
import { getHazardId } from '../config/layers';

const hazardConfig = {
  fluvial: {
    paramDomains: {
      returnPeriod: [20, 50, 100, 200, 500, 1500],
    },
    paramDefaults: {
      returnPeriod: 20,

      rcp: 'baseline',
      epoch: 2010,
      confidence: 'None',
    },
  },
  surface: {
    paramDomains: {
      returnPeriod: [20, 50, 100, 200, 500, 1500],
    },
    paramDefaults: {
      returnPeriod: 20,

      rcp: 'baseline',
      epoch: 2010,
      confidence: 'None',
    },
  },
  coastal: {
    paramDomains: {
      returnPeriod: [1, 2, 5, 10, 50, 100],
      epoch: [2010, 2030, 2050, 2070, 2100],
      rcp: ['baseline', '2x6', '4x5', '8x5'],
    },
    paramDefaults: {
      returnPeriod: 1,
      epoch: 2010,
      rcp: 'baseline',

      confidence: 'None',
    },
    paramDependencies: {
      rcp: ({ epoch }) => {
        if (epoch === 2010) return ['baseline'];
        if (epoch === 2050 || epoch === 2100) return ['2x6', '4x5', '8x5'];
        if (epoch === 2030 || epoch === 2070) return ['4x5', '8x5'];
      },
    },
  },
  cyclone: {
    paramDomains: {
      returnPeriod: [
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000, 5000,
        6000, 7000, 8000, 9000, 10000,
      ],
      epoch: [2010, 2050, 2100],
      rcp: ['baseline', '4x5', '8x5'],
      confidence: [5, 50, 95],
    },
    paramDefaults: {
      returnPeriod: 10,
      epoch: 2010,
      rcp: 'baseline',
      confidence: 50,
    },
    paramDependencies: {
      rcp: ({ epoch }) => {
        if (epoch === 2010) return ['baseline'];
        if (epoch === 2050 || epoch === 2100) return ['4x5', '8x5'];
      },
    },
  },
};

const hazardTypes = Object.keys(hazardConfig);

export interface SingleHazardSelection {
  show: boolean;
  paramSelection: {
    returnPeriod?: number;
    epoch?: number;
    rcp?: string;
    confidence?: string | number;
  };
  paramOptions: {
    returnPeriod?: number[];
    epoch?: number[];
    rcp?: string[];
    confidence?: (string | number)[];
  };
}

export type HazardSelectionSet = { [k: string]: SingleHazardSelection };

function processHazardSelectionUpdate(hazardType: string, newSelection: SingleHazardSelection) {
  const { paramDomains, paramDependencies } = hazardConfig[hazardType];
}

export const useHazardSelection = () => {
  const [hazardShow, setHazardShow] = useState(Object.fromEntries(hazardTypes.map((ht) => [ht, false])));
  const [hazardParams, setHazardParams] = useState(
    Object.fromEntries(hazardTypes.map((ht) => [ht, hazardConfig[ht].paramDefaults])),
  );
  const [hazardOptions, setHazardOptions] = useState(
    Object.fromEntries(hazardTypes.map((ht) => [ht, hazardConfig[ht].paramDomains])),
  );

  // const [hazardSelection, setHazardSelection] = useState<HazardSelectionSet>();
  // const setSingleHazardSelection = useCallback(
  //   (hazardType, hazardTypeSelection) => {
  //     setHazardSelection({
  //       ...hazardSelection,
  //       [hazardType]: processHazardSelectionUpdate(hazardType, hazardTypeSelection),
  //     });
  //   },
  //   [hazardSelection],
  // );

  const updateHazardShow = useCallback(
    (hazardType: string, show: boolean) => {
      setHazardShow({ ...hazardShow, [hazardType]: show });
    },
    [hazardShow],
  );

  const updatedHazardParam = useCallback(
    (hazardType: string, paramName: string, paramValue: any) => {
      const oldParams = hazardParams[hazardType];

      const newParams = { ...oldParams, [paramName]: paramValue };

      setHazardParams({ ...hazardParams, [hazardType]: newParams });
    },
    [hazardParams],
  );

  const hazardVisibilitySet = useMemo(() => {
    const visibility: any = {};

    for (const hazardType of hazardTypes) {
      if (hazardShow[hazardType]) {
        visibility[getHazardId({ ...hazardParams[hazardType], hazardType })] = true;
      }
    }
    return visibility;
  }, [hazardShow, hazardParams]);

  return {
    hazardShow,
    hazardParams,
    hazardOptions,
    // hazardTypeShow,
    // hazardParamSelections,
    // hazardParamOptions,
    // setHazardTypeShow,
    // setHazardTypeParamSelections,
    setSingleHazardShow: updateHazardShow,
    setSingleHazardParam: updatedHazardParam,
    // setSingleHazardSelection,
    hazardVisibilitySet,
    // {
    //   [getHazardId({ hazardType: 'cyclone', returnPeriod: 10000, rcp: 'baseline', epoch: 2010, confidence: 50 })]: true,
    //   [getHazardId({ hazardType: 'fluvial', returnPeriod: 50, rcp: 'baseline', epoch: 2010, confidence: 'None' })]:
    //     true,
    // },
  };
};
