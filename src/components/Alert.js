import { Snackbar } from "@material-ui/core";
import { CryptoState } from "../CryptoContext";
import MuiAlert from "@material-ui/lab/Alert";

const Alert = () => {
  const { alert, setAlert } = CryptoState();

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlert({ open: false });
  };

  return (
    <Snackbar
      open={alert?.open || false}
      autoHideDuration={3000}
      onClose={handleCloseAlert}
    >
      <MuiAlert
        onClose={handleCloseAlert}
        elevation={10}
        variant="filled"
        severity={alert?.type || 'info'}
      >
        {alert?.message || ''}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;