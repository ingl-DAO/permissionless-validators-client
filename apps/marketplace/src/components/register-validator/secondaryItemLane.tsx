import { AddOutlined, CloseOutlined } from '@mui/icons-material';
import { Button, TableCell, TableRow, TextField } from '@mui/material';
import theme from '../../theme/theme';
import { DevValidatorSecondaryItem } from './secondaryItems';

export default function SecondaryItemLane({
  deleteItem,
  newLane = false,
  item: { description, name, price, id },
  item,
  handleChange,
}: {
  deleteItem: () => void;
  newLane?: boolean;
  item: DevValidatorSecondaryItem;
  handleChange: (val: DevValidatorSecondaryItem) => void;
}) {
  return (
    <TableRow
      sx={{
        padding: `0 ${theme.spacing(4.625)}`,
      }}
    >
      <TableCell>
        <TextField
          size="small"
          fullWidth
          required
          onChange={(event) =>
            handleChange({ ...item, name: event.target.value })
          }
          value={name}
          sx={{
            '& input, & div': {
              backgroundColor: theme.common.inputBackground,
              color: 'white',
              '&::placeholder': {
                color: 'white',
              },
            },
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          value={description}
          size="small"
          fullWidth
          required
          onChange={(event) =>
            handleChange({ ...item, description: event.target.value })
          }
          sx={{
            '& input, & div': {
              backgroundColor: theme.common.inputBackground,
              color: 'white',
              '&::placeholder': {
                color: 'white',
              },
            },
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          required
          value={price}
          onChange={(event) =>
            handleChange({ ...item, price: Number(event.target.value) })
          }
          type="number"
          sx={{
            '& input, & div': {
              backgroundColor: theme.common.inputBackground,
              color: 'white',
              '&::placeholder': {
                color: 'white',
              },
            },
          }}
        />
      </TableCell>
      <TableCell>
        <Button
          startIcon={newLane ? <AddOutlined /> : <CloseOutlined />}
          variant="text"
          color={newLane ? 'inherit' : 'primary'}
          onClick={deleteItem}
          sx={{
            padding: theme.spacing(1.5),
            color: newLane ? 'white' : theme.palette.primary.main,
            backgroundColor: theme.common.inputBackground,
            '& .MuiButton-startIcon': {
              margin: 0,
            },
          }}
        />
      </TableCell>
    </TableRow>
  );
}
