import { createStyles, makeStyles } from "@mui/styles";

export const useProgressBarStyles = makeStyles(() =>
  createStyles({
    progressBar: {
      // Disable the transition animation from 100 to 0 inside the progress bar
      '&[aria-valuenow="0"]': {
        "& > $progressBarInner": {
          transition: "none"
        }
      }
    },
    progressBarInner: {}
  })
);
