import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';

import BackgroundControl from './BackgroundControl';
import PositionControl from './PositionControl';
import Tooltip from './Tooltip';
import FeatureSidebar from './FeatureSidebar';
import Help from './Help';
import FloodControl from './FloodControl';
import NetworkControl from './NetworkControl';
import RiskControl from './RiskControl';

class Map extends React.Component {
  constructor(props) {
    super(props);
    const layerVisibility = {};
    for (const layer of props.dataLayers) {
      layerVisibility[layer.key] = true;
    }
    this.state = {
      lng: props.lng || -77.28,
      lat: props.lat || 18.14,
      zoom: props.zoom || 8,
      selectedFeature: undefined,
      scenario: 'baseline',
      floodtype: 'fluvial',
      floodlevel: {
        _1m2m: true,
        _2m3m: true,
        _3m4m: true,
        _4m999m: true,
      },
      showHelp: false,
      duration: 30,
      growth_rate_percentage: 2.8,
      riskMetric: 'total',
      layerVisibility: layerVisibility,
      background: 'light',
    };
    this.map = undefined;
    this.mapContainer = React.createRef();
    this.tooltipContainer = undefined;

    this.onLayerVisChange = this.onLayerVisChange.bind(this);
    this.onBackgroundChange = this.onBackgroundChange.bind(this);

    this.setScenario = this.setScenario.bind(this);
    this.setFloodType = this.setFloodType.bind(this);
    this.setFloodLevel = this.setFloodLevel.bind(this);
    this.setRiskMetric = this.setRiskMetric.bind(this);
    this.setMap = this.setMap.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);
    this.updateBCR = this.updateBCR.bind(this);
    this.networkBaseLayerID = this.networkBaseLayerID.bind(this);
  }

  setScenario(scenario) {
    this.setState({
      scenario: scenario,
    });
    this.setMap(scenario, this.state.floodtype, this.state.floodlevel);
  }

  setFloodType(floodtype) {
    this.setState({
      floodtype: floodtype,
    });
    this.setMap(this.state.scenario, floodtype, this.state.floodlevel);
  }

  setFloodLevel(level, value) {
    let floodlevel = Object.assign({}, this.state.floodlevel);
    floodlevel[level] = value;

    this.setState({
      floodlevel: floodlevel,
    });

    this.setMap(this.state.scenario, this.state.floodtype, floodlevel);
  }

  setRiskMetric(riskMetric) {
    const map_style = this.props.map_style;
    this.setState({
      riskMetric: riskMetric,
    });

    let calc;

    if (map_style !== 'electricity') {
      // EAD has EAEL baked in to the numbers in road and rail
      if (riskMetric === 'total') {
        // EAD subtract 335/365 of EAEL (annual) to get total
        // assuming 30-day disruption
        calc = ['-', ['get', 'EAD_max'], ['*', 0.917808219178, ['coalesce', ['get', 'EAEL'], 0]]];
      }
      if (riskMetric === 'EAD') {
        // EAD subtract EAEL to get direct only
        calc = ['-', ['get', 'EAD_max'], ['coalesce', ['get', 'EAEL'], 0]];
      }
      if (riskMetric === 'EAEL') {
        calc = ['*', 0.0821917808219, ['coalesce', ['get', 'EAEL'], 0]];
      }
    } else {
      // EAD does not include EAEL in electricity
      // EAEL here is in annual dollars, so multiply by
      // 1e-6 * (30/365)
      // to get 30-day disruption in US$m
      if (riskMetric === 'total') {
        calc = ['+', ['get', 'EAD_max'], ['*', 0.0000000821917808219, ['coalesce', ['get', 'EAEL'], 0]]];
      }
      if (riskMetric === 'EAD') {
        calc = ['get', 'EAD_max'];
      }
      if (riskMetric === 'EAEL') {
        calc = ['*', 0.0000000821917808219, ['coalesce', ['get', 'EAEL'], 0]];
      }
    }

    const paint_color = [
      'interpolate-lab',
      ['linear'],
      calc,
      0,
      ['to-color', '#b2afaa'],
      0.000000001,
      ['to-color', '#fff'],
      0.001,
      ['to-color', '#fcfcb8'],
      0.01,
      ['to-color', '#ff9c66'],
      0.1,
      ['to-color', '#d03f6f'],
      1,
      ['to-color', '#792283'],
      10,
      ['to-color', '#3f0a72'],
      100,
      ['to-color', '#151030'],
    ];

    if (map_style === 'roads') {
      this.map.setPaintProperty('trunk', 'line-color', paint_color);
      this.map.setPaintProperty('primary', 'line-color', paint_color);
      this.map.setPaintProperty('secondary', 'line-color', paint_color);
      this.map.setPaintProperty('roads_other', 'line-color', paint_color);
      this.map.setPaintProperty('motorway', 'line-color', paint_color);
    }
    if (map_style === 'rail' || map_style === 'electricity') {
      this.map.setPaintProperty(map_style, 'line-color', paint_color);
    }
  }

  setMap(scenario, floodtype, floodlevel) {
    var flood_layers = ['1m2m', '2m3m', '3m4m', '4m999m'];
    var flood_layer_colors = {
      '4m999m': '#072f5f',
      '3m4m': '#1261a0',
      '2m3m': '#3895d3',
      '1m2m': '#58cced',
    };

    for (var i in flood_layers) {
      var mapLayer = this.map.getLayer('flood_' + flood_layers[i]);

      if (typeof mapLayer !== 'undefined') {
        this.map.removeLayer('flood_' + flood_layers[i]);
      }

      if (floodlevel['_' + flood_layers[i]]) {
        this.map.addLayer(
          {
            id: 'flood_' + flood_layers[i],
            type: 'fill',
            source: 'flood',
            'source-layer': scenario + '_' + floodtype + '_1in1000_' + flood_layers[i],
            paint: {
              'fill-color': flood_layer_colors[flood_layers[i]],
            },
          },
          this.networkBaseLayerID(),
        );
      }
    }
  }

  networkBaseLayerID() {
    // insert before (under) road/rail/bridges/air/water/labels
    let before_layer_id;

    switch (this.props.map_style) {
      case 'flood':
        before_layer_id = 'country_labels';
        break;
      case 'risk':
        before_layer_id = 'road_class_6';
        break;
      default:
        before_layer_id = 'country_labels';
    }
    return before_layer_id;
  }

  setTooltip(features) {
    ReactDOM.render(
      React.createElement(Tooltip, { features: features, map_style: this.props.map_style }),
      this.tooltipContainer,
    );
  }

  updateBCR(data) {
    const { duration, growth_rate_percentage } = data;

    this.setState({
      duration: duration,
      growth_rate_percentage: growth_rate_percentage,
    });
  }

  toggleHelp(e) {
    const helpTopic = e.target.dataset.helpTopic;
    const showHelp = !this.state.showHelp || this.state.helpTopic !== helpTopic;
    this.setState({
      showHelp: showHelp,
      helpTopic: helpTopic,
    });
  }

  componentDidMount() {
    const { lng, lat, zoom } = this.state;
    const MAPBOX_KEY = 'pk.eyJ1IjoidG9tcnVzc2VsbCIsImEiOiJjaXZpMTFpdGkwMDQ1MnptcTh4ZzRzeXNsIn0.ZSvSOHSsWBQ44QNhA71M6Q';
    mapboxgl.accessToken = MAPBOX_KEY;
    this.map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: `/styles/${this.props.map_style}/style.json`,
      center: [lng, lat],
      zoom: zoom,
      minZoom: 3,
      maxZoom: 16,
    });

    var nav = new mapboxgl.NavigationControl();
    this.map.addControl(nav, 'top-right');

    var scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric',
    });
    this.map.addControl(scale, 'bottom-left');

    this.map.on('move', () => {
      const { lng, lat } = this.map.getCenter();
      this.setState({
        lng: lng,
        lat: lat,
        zoom: this.map.getZoom(),
      });
    });

    // Container to put React generated content in.
    this.tooltipContainer = document.createElement('div');

    const tooltip = new mapboxgl.Marker(
      this.tooltipContainer,
      { offset: [-150, 0] }, // offset to match width set in tooltip-body css
    )
      .setLngLat([0, 0])
      .addTo(this.map);

    this.map.on('mousemove', (e) => {
      const features = this.map.queryRenderedFeatures(e.point);

      const clickableFeatures = features.filter((f) => this.props.dataSources.includes(f.source));

      const tooltipFeatures = features.filter((f) => this.props.tooltipLayerSources.includes(f.source));

      this.map.getCanvas().style.cursor = clickableFeatures.length || tooltipFeatures.length ? 'pointer' : '';

      tooltip.setLngLat(e.lngLat);
      this.setTooltip(tooltipFeatures);
    });

    this.map.on('click', (e) => {
      const features = this.map.queryRenderedFeatures(e.point);
      const clickableFeatures = features.filter((f) => this.props.dataSources.includes(f.source));

      const feature = clickableFeatures.length ? clickableFeatures[0] : undefined;

      if (this.props.map_style === 'regions') {
        if (feature) {
          // pass region code up to App for RegionSummary to use
          this.props.onRegionSelect(feature.properties);
        } else {
          this.props.onRegionSelect(undefined);
        }
      } else {
        if (feature) {
          this.drawFeature(feature);
        } else {
          // remove current highlight
          if (this.map.getLayer('featureHighlight')) {
            this.map.removeLayer('featureHighlight');
          }
        }
        this.setState({
          selectedFeature: feature,
        });
      }
    });
  }

  drawFeature(feature) {
    // remove current highlight
    if (this.map.getLayer('featureHighlight')) {
      this.map.removeLayer('featureHighlight');
    }

    // add highlight layer
    const source = this.map.getSource('featureHighlight');
    if (source) {
      source.setData(feature.toJSON());
    } else {
      this.map.addSource('featureHighlight', {
        type: 'geojson',
        data: feature.toJSON(),
      });
    }

    if (feature.layer.type === 'line') {
      this.map.addLayer(
        {
          id: 'featureHighlight',
          type: 'line',
          source: 'featureHighlight',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': 'yellow',
            'line-width': {
              base: 1,
              stops: [
                [3, 1],
                [10, 8],
                [17, 16],
              ],
            },
          },
        },
        feature.layer.id,
      );
    }
    if (feature.layer.type === 'circle') {
      this.map.addLayer(
        {
          id: 'featureHighlight',
          type: 'circle',
          source: 'featureHighlight',
          paint: {
            'circle-color': 'yellow',
            'circle-radius': {
              base: 1,
              stops: [
                [3, 4],
                [10, 12],
                [17, 20],
              ],
            },
          },
        },
        feature.layer.id,
      );
    }
  }

  componentDidUpdate(prev) {
    if (prev.map_style !== this.props.map_style) {
      fetch(`/styles/${this.props.map_style}/style.json`)
        .then((response) => response.json())
        .then((data) => {
          this.map.setStyle(data);
          const feature = this.state.selectedFeature;
          if (feature && this.props.dataSources.includes(feature.source)) {
            this.drawFeature(feature);
          }
          if (
            this.props.map_style === 'roads' ||
            this.props.map_style === 'rail' ||
            this.props.map_style === 'electricity'
          ) {
            this.setRiskMetric(this.state.riskMetric);
          }
        });
    }
  }

  componentWillUnmount() {
    this.map.remove();
  }

  onLayerVisChange(e) {
    const layer = e.target.value;
    if (e.target.checked) {
      this.map.setLayoutProperty(layer, 'visibility', 'visible');
    } else {
      this.map.setLayoutProperty(layer, 'visibility', 'none');
    }
    const { layerVisibility } = this.state;
    layerVisibility[layer] = e.target.checked;
    this.setState({ layerVisibility: layerVisibility });
  }

  onBackgroundChange(e) {
    const { background } = this.state;
    const nextBackground = e.target.value;
    this.map.setLayoutProperty(nextBackground, 'visibility', 'visible');
    this.map.setLayoutProperty(background, 'visibility', 'none');
    this.setState({ background: nextBackground });
  }

  render() {
    const { lng, lat, zoom, selectedFeature, layerVisibility, background } = this.state;
    const { map_style, dataLayers, tooltipLayerSources } = this.props;
    return (
      <Fragment>
        <Drawer variant="permanent">
          <Toolbar />
          <div className="drawer-contents">
            {dataLayers.length ? (
              <Fragment>
                <h2 className="h4">Select layers</h2>
                <NetworkControl
                  onLayerVisChange={this.onLayerVisChange}
                  dataLayers={dataLayers}
                  layerVisibility={layerVisibility}
                />
                <BackgroundControl onBackgroundChange={this.onBackgroundChange} background={background} />
              </Fragment>
            ) : null}
            {map_style === 'regions' ? (
              <Fragment>
                <small>Max Total Expected Risk (EAD + EAEL for 30 day disruption, million US$)</small>
                <svg width="270" height="25" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="summary_gradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="12.5%" stopColor="#fee0d2" />
                      <stop offset="25%" stopColor="#fdc1a9" />
                      <stop offset="37.5%" stopColor="#fc9d7f" />
                      <stop offset="50%" stopColor="#fb7859" />
                      <stop offset="62.5%" stopColor="#f4513b" />
                      <stop offset="75%" stopColor="#de2c26" />
                      <stop offset="87.5%" stopColor="#bf161b" />
                      <stop offset="100%" stopColor="#950b13" />
                    </linearGradient>
                  </defs>
                  <g fill="none" fontSize="10" fontFamily="sans-serif"></g>
                  <rect x="2" y="0" width="258" height="10" fill="url(#summary_gradient)" />
                  <g fill="none" fontSize="10" transform="translate(2,10)" fontFamily="sans-serif" textAnchor="middle">
                    <g transform="translate(0.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        0
                      </text>
                    </g>
                    <g transform="translate(32.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        0.1
                      </text>
                    </g>
                    <g transform="translate(65,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        0.5
                      </text>
                    </g>
                    <g transform="translate(97.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        2.5
                      </text>
                    </g>
                    <g transform="translate(130,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        10
                      </text>
                    </g>
                    <g transform="translate(162.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        50
                      </text>
                    </g>
                    <g transform="translate(195,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        250
                      </text>
                    </g>
                    <g transform="translate(227.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        1k
                      </text>
                    </g>
                    <g transform="translate(257.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        5k
                      </text>
                    </g>
                  </g>
                </svg>
              </Fragment>
            ) : null}
            {map_style === 'risk' ? (
              <div>
                <small>
                  Feature size indicates maximum expected annual damages plus maximum expected annual losses for a
                  30-day disruption
                </small>
                <span className="dot line" style={{ height: '2px', width: '24px' }}></span>&lt;1 million USD
                <br />
                <span className="dot line" style={{ height: '4px', width: '24px' }}></span>1-5 million USD
                <br />
                <span className="dot line" style={{ height: '6px', width: '24px' }}></span>5-10 million USD
                <br />
                <span className="dot line" style={{ height: '8px', width: '24px' }}></span>&gt;10 million USD
                <br />
                <a href="#help" data-help-topic="vietnam" onClick={this.toggleHelp}>
                  {this.state.showHelp && this.state.helpTopic === 'vietnam' ? 'Hide info' : 'More info'}
                </a>
              </div>
            ) : null}
            {map_style === 'roads' || map_style === 'rail' || map_style === 'electricity' ? (
              <RiskControl setRiskMetric={this.setRiskMetric} riskMetric={this.state.riskMetric} />
            ) : null}
            {map_style === 'roads' ? <small>Road network data extracted from OpenStreetMap</small> : null}
            {map_style === 'rail' ? (
              <div>
                <small>Rail network data extracted from OpenStreetMap</small>
              </div>
            ) : null}
            {map_style === 'electricity' ? <small>Energy network data extracted from Gridfinder</small> : null}
            {map_style === 'hazards' ? (
              <Fragment>
                <small>Coastal flood depth (m)</small>
                <svg width="270" height="25" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="coastal_gradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#9df4b0" />
                      <stop offset="100%" stopColor="#0b601d" />
                    </linearGradient>
                  </defs>
                  <g fill="none" fontSize="10" fontFamily="sans-serif"></g>
                  <rect x="2" y="0" width="258" height="10" fill="url(#coastal_gradient)" />
                  <g fill="none" fontSize="10" transform="translate(2,10)" fontFamily="sans-serif" textAnchor="middle">
                    <g transform="translate(0.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        0
                      </text>
                    </g>
                    <g transform="translate(130,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        2.5
                      </text>
                    </g>
                    <g transform="translate(257.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        5
                      </text>
                    </g>
                  </g>
                </svg>
                <small>Fluvial flood depth (m)</small>
                <svg width="270" height="25" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="fluvial_gradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#58cced" />
                      <stop offset="100%" stopColor="#072f5f" />
                    </linearGradient>
                  </defs>
                  <g fill="none" fontSize="10" fontFamily="sans-serif"></g>
                  <rect x="2" y="0" width="258" height="10" fill="url(#fluvial_gradient)" />
                  <g fill="none" fontSize="10" transform="translate(2,10)" fontFamily="sans-serif" textAnchor="middle">
                    <g transform="translate(0.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        0
                      </text>
                    </g>
                    <g transform="translate(130,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        2.5
                      </text>
                    </g>
                    <g transform="translate(257.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        5
                      </text>
                    </g>
                  </g>
                </svg>
                <small>Cyclone gust speed (m/s)</small>
                <svg width="270" height="25" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="cyclone_gradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#f9d5cb" />
                      <stop offset="100%" stopColor="#d44118" />
                    </linearGradient>
                  </defs>
                  <g fill="none" fontSize="10" fontFamily="sans-serif"></g>
                  <rect x="2" y="0" width="258" height="10" fill="url(#cyclone_gradient)" />
                  <g fill="none" fontSize="10" transform="translate(2,10)" fontFamily="sans-serif" textAnchor="middle">
                    <g transform="translate(0.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        0
                      </text>
                    </g>
                    <g transform="translate(130,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        25
                      </text>
                    </g>
                    <g transform="translate(257.5,0)">
                      <line stroke="currentColor" y2="3"></line>
                      <text fill="currentColor" y="6" dy="0.71em">
                        50
                      </text>
                    </g>
                  </g>
                </svg>
                <a href="#help" data-help-topic="hazards" onClick={this.toggleHelp}>
                  {this.state.showHelp && this.state.helpTopic === 'hazards' ? 'Hide info' : 'More info'}
                </a>
              </Fragment>
            ) : null}
            {tooltipLayerSources.includes('flood') ? (
              <Fragment>
                <FloodControl
                  setScenario={this.setScenario}
                  setFloodType={this.setFloodType}
                  setFloodLevel={this.setFloodLevel}
                />
                <a href="#help" data-help-topic="flood" onClick={this.toggleHelp}>
                  {this.state.showHelp && this.state.helpTopic === 'flood' ? 'Hide info' : 'More info'}
                </a>
              </Fragment>
            ) : null}
          </div>
        </Drawer>
        <div className="map-height">
          {this.state.showHelp ? (
            <Help topic={this.state.helpTopic} />
          ) : (
            <FeatureSidebar
              feature={selectedFeature}
              updateBCR={this.updateBCR}
              duration={this.state.duration}
              growth_rate_percentage={this.state.growth_rate_percentage}
            />
          )}
          <PositionControl lat={lat} lng={lng} zoom={zoom} />
          <div ref={this.mapContainer} className="map" />
        </div>
      </Fragment>
    );
  }
}

Map.propTypes = {
  map_style: PropTypes.string.isRequired,
  lat: PropTypes.number,
  lng: PropTypes.number,
  zoom: PropTypes.number,
  dataSources: PropTypes.array.isRequired,
  dataLayers: PropTypes.array.isRequired,
  tooltipLayerSources: PropTypes.array.isRequired,
  onRegionSelect: PropTypes.func,
};

export default Map;
