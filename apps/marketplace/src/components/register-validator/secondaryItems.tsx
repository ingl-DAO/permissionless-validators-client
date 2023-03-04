import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import { ValidatorSecondaryItem } from '../../interfaces';
import theme from '../../theme/theme';
import BareCustomInput, { Label } from './bareCustomInput';
import SecondaryItemLane from './secondaryItemLane';

export interface DevValidatorSecondaryItem extends ValidatorSecondaryItem {
  id: string;
}

export default function SecondaryItems({
  handleSubmit,
  onPrev,
  mediatableDate,
  setMediatableDate,
  secondaryItems: si,
  disabled,
}: {
  handleSubmit: (val: DevValidatorSecondaryItem[]) => void;
  onPrev: (val: DevValidatorSecondaryItem[]) => void;
  mediatableDate: Date;
  setMediatableDate: (val: Date) => void;
  secondaryItems: DevValidatorSecondaryItem[];
  disabled: boolean;
}) {
  const [secondaryItems, setSecondaryItems] =
    useState<DevValidatorSecondaryItem[]>(si);

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(4),
        height: '100%',
        gridTemplateRows: 'auto auto 1fr',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(3),
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">Secondary items information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <Button
            variant="contained"
            color="inherit"
            onClick={() => onPrev([])}
            sx={{ color: 'black' }}
            disabled={disabled}
          >
            Prev
          </Button>
          <Button
            variant="contained"
            disabled={disabled}
            color="primary"
            onClick={() => {
              handleSubmit(secondaryItems);
            }}
          >
            List Now
          </Button>
        </Box>
      </Box>
      <Typography variant="body2">
        A secondary item is any thing valuable, related to the validator and
        which can be sold alongside with the vote account for the continous
        proper functioning of the entity.
      </Typography>
      <Scrollbars autoHide>
        <Box sx={{ display: 'grid', rowGap: theme.spacing(1) }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {[
                  { label: 'Item', subLabel: 'Name e.g. Discord' },
                  {
                    label: 'Description',
                    subLabel: 'Name e.g Onwership shall be transferred',
                  },
                  { label: 'Cost', subLabel: 'In SOL' },
                ].map(({ label, subLabel }, index) => (
                  <TableCell key={index}>
                    <Label label={label} subLabel={subLabel} />
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {secondaryItems.map((item) => {
                const { id } = item;
                return (
                  <SecondaryItemLane
                    item={item}
                    newLane={disabled}
                    handleChange={(val: DevValidatorSecondaryItem) => {
                      setSecondaryItems([
                        ...secondaryItems.map((item) => {
                          const { id: _ } = item;
                          if (_ !== id) return item;
                          return val;
                        }),
                      ]);
                    }}
                    deleteItem={() => {
                      setSecondaryItems(
                        secondaryItems.filter(({ id: _ }) => _ !== id)
                      );
                    }}
                  />
                );
              })}
              <SecondaryItemLane
                newLane
                handleChange={(val: DevValidatorSecondaryItem) =>
                  alert(JSON.stringify(val))
                }
                item={{
                  description: '',
                  name: '',
                  price: 0,
                  id: crypto.randomUUID(),
                }}
                deleteItem={() => {
                  const val = secondaryItems.find(({ name: _ }) => _ === '');
                  if (!val)
                    setSecondaryItems([
                      ...secondaryItems,
                      {
                        description: '',
                        name: '',
                        price: 0,
                        id: crypto.randomUUID(),
                      },
                    ]);
                }}
              />
            </TableBody>
          </Table>
          <BareCustomInput
            onChange={(val: Date) => {
              setMediatableDate(val);
            }}
            value={mediatableDate}
            label={'Mediatable date'}
            subLabel={
              'The date from which mediation can be requested to ingl, should in case settlement is not archieved amongst the parties.'
            }
          />
        </Box>
      </Scrollbars>
    </Box>
  );
}
