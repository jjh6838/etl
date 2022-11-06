import { Alert } from '@mui/material';
import { FC } from 'react';
import { atomFamily, selectorFamily, useRecoilValue } from 'recoil';

import { Layer, Section, SidebarPanel, SidebarRoot } from '@/lib/data-selection/sidebar/components';
import { getParentPath } from '@/lib/data-selection/sidebar/paths';

import { viewState } from '@/state/view';

import { BuildingDensityControl } from './sections/buildings/BuildingDensityControl';
import {
  CoastalControl,
  CycloneControl,
  DroughtControl,
  EarthquakeControl,
  ExtremeHeatControl,
  FluvialControl,
} from './sections/hazards/HazardsControl';
import { IndustryControl } from './sections/industry/IndustryControl';
import { NetworkControl } from './sections/networks/NetworkControl';
import { HdiControl } from './sections/vulnerability/HdiControl';
import { TravelTimeControl } from './sections/vulnerability/TravelTimeControl';
import { WdpaControls } from './sections/vulnerability/WdpaControl';

const viewLabels = {
  hazard: 'Hazard',
  exposure: 'Exposure',
  vulnerability: 'Vulnerability',
  risk: 'Risk',
};

export const sidebarVisibilityToggleState = atomFamily({
  key: 'sidebarVisibilityToggleState',
  default: false,
});

export const sidebarExpandedState = atomFamily({
  key: 'sidebarExpandedState',
  default: false,
});

export const sidebarPathVisibilityState = selectorFamily<boolean, string>({
  key: 'sidebarPathVisibilityState',
  get:
    (path: string) =>
    ({ get }) => {
      const parentPath = getParentPath(path);

      return (
        (parentPath === '' || get(sidebarPathVisibilityState(parentPath))) && get(sidebarVisibilityToggleState(path))
      );
    },
});

const OnlyInView: FC<{ view: string }> = ({ view, children }) => {
  const currentView = useRecoilValue(viewState);

  return currentView === view ? <>{children}</> : null;
};

export const SidebarContent: FC<{}> = () => {
  const view = useRecoilValue(viewState);
  const knownViews = Object.keys(viewLabels);

  if (!knownViews.includes(view)) {
    return <Alert severity="error">Unknown view!</Alert>;
  }

  return (
    <SidebarRoot visibilityState={sidebarVisibilityToggleState} expandedState={sidebarExpandedState}>
      <Section path="hazards" title="Hazards">
        <Layer path="fluvial" title="River Flooding">
          <FluvialControl />
        </Layer>
        <Layer path="coastal" title="Coastal Flooding">
          <CoastalControl />
        </Layer>
        <Layer path="cyclone" title="Tropical Cyclones">
          <CycloneControl />
        </Layer>
        <Layer path="extreme_heat" title="Extreme Heat">
          <ExtremeHeatControl />
        </Layer>
        <Layer path="drought" title="Droughts">
          <DroughtControl />
        </Layer>
        <Layer path="earthquake" title="Seismic">
          <EarthquakeControl />
        </Layer>
        <Layer path="wildfire" title="Wildfires" disabled />
      </Section>
      <Section path="exposure" title="Exposure">
        <Layer path="population" title="Population" />
        <Layer path="buildings" title="Buildings">
          <BuildingDensityControl />
        </Layer>
        <Layer path="infrastructure" title="Infrastructure">
          <NetworkControl />
        </Layer>
        <Layer path="industry" title="Industry">
          <IndustryControl />
        </Layer>
        <Layer path="healthsites" title="Healthcare Facilities" />
        <Layer path="land-cover" title="Land Cover" disabled />
        <Layer path="organic-carbon" title="Soil Organic Carbon" />
      </Section>
      <Section path="vulnerability" title="Vulnerability">
        <Section path="human" title="Human">
          <Layer path="human-development" title="Human Development">
            <HdiControl />
          </Layer>
          <Layer path="travel-time" title="Travel Time to Healthcare">
            <TravelTimeControl />
          </Layer>
        </Section>
        <Section path="nature" title="Nature">
          <Layer path="biodiversity-intactness" title="Biodiversity Intactness" />
          <Layer path="forest-integrity" title="Forest Landscape Integrity" />
          <Layer path="protected-areas" title="Protected Areas (WDPA)">
            <WdpaControls />
          </Layer>
        </Section>
      </Section>
      <OnlyInView view="risk">
        <SidebarPanel path="risk" title="Risk">
          {/* TODO: RiskControl... */}
        </SidebarPanel>
      </OnlyInView>
    </SidebarRoot>
  );
};
