import { Box, ClickAwayListener, IconButton, Paper } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useRecoilState } from 'recoil';

import { placeSearchActiveState } from './search-state';
import { MapSearchField } from './MapSearchField';

const blankSpaceWidth = 8;

export const MapSearch = () => {
  const [expanded, setExpanded] = useRecoilState(placeSearchActiveState);

  return (
    <ClickAwayListener onClickAway={(e) => setExpanded(false)}>
      <Box style={{ display: 'inline-flex' }}>
        {/* display: inline-flex causes box to shrink to contents */}
        <Paper elevation={1}>
          <Box
            style={{ display: 'flex', flexDirection: 'row' }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setExpanded(false);
              }
            }}
          >
            <IconButton
              title="Search"
              onClick={() => setExpanded(!expanded)}
              style={{
                paddingInline: blankSpaceWidth,
                paddingBlock: blankSpaceWidth - 2,
                backgroundColor: 'white',
                color: 'black',
              }}
            >
              <SearchIcon />
            </IconButton>
            {expanded && (
              <Box style={{ marginRight: blankSpaceWidth }}>
                <MapSearchField />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </ClickAwayListener>
  );
};
