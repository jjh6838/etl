import React, { Fragment, useState } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Nav from './Nav';
import Map from './Map';
import PageIntro from './PageIntro';
import RegionSummary from './RegionSummary';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const App = () => {
  const [region, setRegion] = useState(undefined);
  return (
  <Router>
    <Fragment>
      <Route path="/" component={Nav}/>
      <main className="map-height">
      <Switch>
        <Route path="/overview">
          <Map
            map_style="overview"
            dataSources={[
              'roads',
              'rail',
              'electricity'
            ]}
            dataLayers={[
              {key: 'KHM_Electricity', label: 'Cambodia Grid', linear: true, color: "#dab540"},
              {key: 'IDN_Electricity', label: 'Indonesia Grid', linear: true, color: "#dab540"},
              {key: 'LAO_Electricity', label: 'Laos Grid', linear: true, color: "#dab540"},
              {key: 'MMR_Electricity', label: 'Myanmar Grid', linear: true, color: "#dab540"},
              {key: 'PHL_Electricity', label: 'Philippines Grid', linear: true, color: "#dab540"},
              {key: 'THA_Electricity', label: 'Thailand Grid', linear: true, color: "#dab540"},
              {key: 'VNM_Electricity', label: 'Vietnam Grid', linear: true, color: "#dab540"},
              {key: 'KHM_Rail', label: 'Cambodia Rail', linear: true, color: "#444"},
              {key: 'IDN_Rail', label: 'Indonesia Rail', linear: true, color: "#444"},
              {key: 'LAO_Rail', label: 'Laos Rail', linear: true, color: "#444"},
              {key: 'MMR_Rail', label: 'Myanmar Rail', linear: true, color: "#444"},
              {key: 'PHL_Rail', label: 'Philippines Rail', linear: true, color: "#444"},
              {key: 'THA_Rail', label: 'Thailand Rail', linear: true, color: "#444"},
              {key: 'VNM_Rail', label: 'Vietnam Rail', linear: true, color: "#444"},
              {key: 'KHM_main', label: 'Cambodia Road', linear: true, color: "#b2afaa"},
              {key: 'IDN_main', label: 'Indonesia Road', linear: true, color: "#b2afaa"},
              {key: 'LAO_main', label: 'Laos Road', linear: true, color: "#b2afaa"},
              {key: 'MMR_main', label: 'Myanmar Road', linear: true, color: "#b2afaa"},
              {key: 'PHL_main', label: 'Philippines Road', linear: true, color: "#b2afaa"},
              {key: 'THA_main', label: 'Thailand Road', linear: true, color: "#b2afaa"},
              {key: 'VNM_main', label: 'Vietnam Road', linear: true, color: "#b2afaa"}

            ]}
            tooltipLayerSources={[
              'roads',
              'rail',
              'electricity'
            ]}
            />
        </Route>
        <Route path="/roads">
          <Map
            map_style="roads"
            dataSources={[
              'roads'
            ]}
            dataLayers={[
              {key: 'KHM_main', label: 'Cambodia Major Roads', linear: true, color: "#e48d14"},
              {key: 'IDN_main', label: 'Indonesia Major Roads', linear: true, color: "#e48d14"},
              {key: 'LAO_main', label: 'Laos Major Roads', linear: true, color: "#e48d14"},
              {key: 'MMR_main', label: 'Myanmar Major Roads', linear: true, color: "#e48d14"},
              {key: 'PHL_main', label: 'Philippines Major Roads', linear: true, color: "#e48d14"},
              {key: 'THA_main', label: 'Thailand Major Roads', linear: true, color: "#e48d14"},
              {key: 'VNM_main', label: 'Vietnam Major Roads', linear: true, color: "#e48d14"},
              {key: 'KHM_other', label: 'Cambodia Minor Roads', linear: true, color: "#e48d14"},
              {key: 'IDN_other', label: 'Indonesia Minor Roads', linear: true, color: "#b2afaa"},
              {key: 'LAO_other', label: 'Laos Minor Roads', linear: true, color: "#b2afaa"},
              {key: 'MMR_other', label: 'Myanmar Minor Roads', linear: true, color: "#b2afaa"},
              {key: 'PHL_other', label: 'Philippines Minor Roads', linear: true, color: "#b2afaa"},
              {key: 'THA_other', label: 'Thailand Minor Roads', linear: true, color: "#b2afaa"},
              {key: 'VNM_other', label: 'Vietnam Minor Roads', linear: true, color: "#b2afaa"}

            ]}
            tooltipLayerSources={[
              'roads'
            ]}
            />
        </Route>
        <Route path="/rail">
          <Map
            map_style="rail"
            dataSources={[
              'rail'
            ]}
            dataLayers={[
              {key: 'KHM_Rail', label: 'Cambodia Rail', linear: true, color: "#444"},
              {key: 'IDN_Rail', label: 'Indonesia Rail', linear: true, color: "#444"},
              {key: 'LAO_Rail', label: 'Laos Rail', linear: true, color: "#444"},
              {key: 'MMR_Rail', label: 'Myanmar Rail', linear: true, color: "#444"},
              {key: 'PHL_Rail', label: 'Philippines Rail', linear: true, color: "#444"},
              {key: 'THA_Rail', label: 'Thailand Rail', linear: true, color: "#444"},
              {key: 'VNM_Rail', label: 'Vietnam Rail', linear: true, color: "#444"}
            ]}
            tooltipLayerSources={[
              'rail'
            ]}
            />
        </Route>
        <Route path="/energy_network">
          <Map
            map_style="electricity"
            dataSources={[
              'electricity'
            ]}
            dataLayers={[
              {key: 'KHM_Electricity', label: 'Cambodia Grid', linear: true, color: "#dab540"},
              {key: 'IDN_Electricity', label: 'Indonesia Grid', linear: true, color: "#dab540"},
              {key: 'LAO_Electricity', label: 'Laos Grid', linear: true, color: "#dab540"},
              {key: 'MMR_Electricity', label: 'Myanmar Grid', linear: true, color: "#dab540"},
              {key: 'PHL_Electricity', label: 'Philippines Grid', linear: true, color: "#dab540"},
              {key: 'THA_Electricity', label: 'Thailand Grid', linear: true, color: "#dab540"},
              {key: 'VNM_Electricity', label: 'Vietnam Grid', linear: true, color: "#dab540"},
            ]}
            tooltipLayerSources={[
              'electricity'
            ]}
            />
        </Route>
        <Route path="/flood">
          <Map
            map_style="flood"
            dataSources={[]}
            dataLayers={[]}
            tooltipLayerSources={['flood']}
            />
        </Route>
        <Route path="/risk">
          <Map
            map_style="risk"
            dataSources={[
              'road'
            ]}
            dataLayers={[
              {key:'road_class_1', label: 'Road Class 1', linear: true, color: "#000004"},
              {key:'road_class_2', label: 'Road Class 2', linear: true, color: "#2c115f"},
              {key:'road_class_3', label: 'Road Class 3', linear: true, color: "#721f81"},
              {key:'road_class_4', label: 'Road Class 4', linear: true, color: "#b73779"},
              {key:'road_class_5', label: 'Road Class 5', linear: true, color: "#f1605d"},
              {key:'road_class_6', label: 'Road Class 6', linear: true, color: "#feb078"}
            ]}
            tooltipLayerSources={[
              'road',
              'flood'
            ]}
            />
        </Route>
        <Route path="/summary">
          <div className="page-col-right">
            <RegionSummary region={region} />
          </div>
          <div className="page-col-left">
            <Map
              map_style="regions"
              dataSources={[
                'boundaries'
              ]}
              dataLayers={[]}
              tooltipLayerSources={[]}
              onRegionSelect={setRegion}
              />
          </div>
        </Route>
        <Route path="/">
          <PageIntro />
        </Route>
      </Switch>
      </main>
    </Fragment>
  </Router>
)
}

export default App;
