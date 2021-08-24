import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';

const NetworkControl = ({ dataLayers, layerVisibility, onLayerVisChange }) => (
  <FormControl component="fieldset">
    <FormLabel component="legend">Infrastructure Layers</FormLabel>
    {dataLayers.map((layer_data) => {
      const layer = layer_data.key;
      const label = layer_data.label;
      const checked = layerVisibility[layer];
      return (
        <FormGroup row key={'toggleLayer' + layer}>
          <FormControlLabel
            control={
              <Checkbox
                data-layer={layer}
                color="primary"
                checked={checked}
                value={layer}
                name={'toggleLayerCheckbox' + layer}
                onChange={onLayerVisChange}
              />
            }
            label={
              <Fragment>
                <span
                  className={layer_data.linear ? 'dot line' : 'dot'}
                  style={{ backgroundColor: layer_data.color }}
                ></span>
                {label}
              </Fragment>
            }
          ></FormControlLabel>
        </FormGroup>
      );
    })}
  </FormControl>
);

NetworkControl.propTypes = {
  onLayerVisChange: PropTypes.func.isRequired,
  dataLayers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  layerVisibility: PropTypes.object.isRequired,
};

export default NetworkControl;
