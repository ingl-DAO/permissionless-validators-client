import { Skeleton, TableCell, TableRow } from '@mui/material';
import theme from '../../theme/theme';

export default function NoTableElement({
  colSpan = 6,
  message,
}: {
  colSpan?: number;
  message: string;
}) {
  return (
    <TableRow
      sx={{
        borderBottom: `1px solid ${theme.common.line}`,
        borderTop: `1px solid ${theme.common.line}`,
        padding: `0 ${theme.spacing(4.625)}`,
      }}
    >
      <TableCell
        colSpan={colSpan}
        align="center"
        sx={{ textAlign: 'center', color: 'white' }}
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

export function TableLaneSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <TableRow
      sx={{
        borderBottom: `1px solid ${theme.common.line}`,
        borderTop: `1px solid ${theme.common.line}`,
        padding: `0 ${theme.spacing(4.625)}`,
      }}
    >
      {[...new Array(cols)].map((_, index) => (
        <TableCell component="th" scope="row" key={index}>
          <Skeleton
            animation="wave"
            sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}
