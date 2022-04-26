import React from 'react';
import { RecoilRoot } from 'recoil';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { CssBaseline, StyledEngineProvider, Toolbar } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { Nav } from './Nav';
import { IntroPage } from './pages/IntroPage';
import { MapPage } from './pages/MapPage';
import { DataPage } from './pages/DataPage';
import { AssetListPage } from 'pages/AssetListPage';
import { theme } from './theme';

import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

export const App = () => {
  return (
    <RecoilRoot>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Router>
            <CssBaseline />
            <Nav />
            <Switch>
              <Route path="/" exact>
                <Toolbar /> {/* Prevents app bar from concealing content*/}
                <IntroPage />
              </Route>
              <Route
                path="/:view(exposure|risk|adaptation|prioritization)"
                render={({ match: { params } }) => <MapPage view={params.view} />}
              />
              <Route path="/data" exact>
                <Toolbar /> {/* Prevents app bar from concealing content*/}
                <DataPage />
              </Route>
              <Route path="/assets" exact>
                <Toolbar /> {/* Prevents app bar from concealing content*/}
                <AssetListPage />
              </Route>
            </Switch>
          </Router>
        </ThemeProvider>
      </StyledEngineProvider>
    </RecoilRoot>
  );
};
