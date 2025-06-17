import { Box, Button, TextField, Divider, Typography } from "@material-ui/core";
import { useState } from "react";
import { CryptoState } from "../../CryptoContext";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useEffect } from "react";

const Login = ({ handleClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAlert } = CryptoState();

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setAlert({
            open: true,
            message: `Sign In Successful. Welcome ${result.user.displayName || result.user.email}`,
            type: "success",
          });
          handleClose();
        }
      } catch (error) {
        console.error("Redirect result error:", error);
        setAlert({
          open: true,
          message: "Authentication failed. Please try again.",
          type: "error",
        });
      }
    };

    checkRedirectResult();
  }, [setAlert, handleClose]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setAlert({
        open: true,
        message: "Please fill all the Fields",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setAlert({
        open: true,
        message: `Sign In Successful. Welcome ${result.user.email}`,
        type: "success",
      });

      handleClose();
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configure custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Try popup first
      const result = await signInWithPopup(auth, provider);
      
      setAlert({
        open: true,
        message: `Sign In Successful. Welcome ${result.user.displayName || result.user.email}`,
        type: "success",
      });

      handleClose();
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      
      // Handle unauthorized domain error specifically
      if (error.code === 'auth/unauthorized-domain') {
        setAlert({
          open: true,
          message: "Domain not authorized for Google Sign-In. Please contact the administrator to add this domain to Firebase authorized domains list.",
          type: "error",
        });
        return;
      }
      
      // If popup is blocked, try redirect method
      if (error.code === 'auth/popup-blocked') {
        try {
          const provider = new GoogleAuthProvider();
          provider.addScope('email');
          provider.addScope('profile');
          provider.setCustomParameters({
            prompt: 'select_account'
          });
          
          // Use redirect instead of popup
          await signInWithRedirect(auth, provider);
          // Note: The redirect will reload the page, so we don't need to handle the result here
          // The result will be handled in the useEffect hook when the page reloads
          return;
        } catch (redirectError) {
          console.error("Redirect sign-in error:", redirectError);
          
          // Handle unauthorized domain error in redirect
          if (redirectError.code === 'auth/unauthorized-domain') {
            setAlert({
              open: true,
              message: "Domain not authorized for Google Sign-In. Please contact the administrator to add this domain to Firebase authorized domains list.",
              type: "error",
            });
          } else {
            setAlert({
              open: true,
              message: "Authentication failed. Please try again or check your browser settings.",
              type: "error",
            });
          }
        }
      } else {
        // Handle other errors
        let errorMessage = "Failed to sign in with Google";
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Sign-in was cancelled";
        } else if (error.code === 'auth/cancelled-popup-request') {
          errorMessage = "Sign-in request was cancelled";
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your connection";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setAlert({
          open: true,
          message: errorMessage,
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={3}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <TextField
        variant="outlined"
        type="email"
        label="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        disabled={loading}
      />
      <TextField
        variant="outlined"
        label="Enter Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        disabled={loading}
      />
      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        style={{ backgroundColor: "#EEBC1D" }}
        disabled={loading}
      >
        {loading ? "Signing In..." : "Login"}
      </Button>
      
      <Box 
        display="flex" 
        alignItems="center" 
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        <Divider style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
        <Typography style={{ color: "grey", fontSize: 14, margin: "0 16px" }}>
          OR
        </Typography>
        <Divider style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
      </Box>
      
      <Button
        variant="contained"
        size="large"
        style={{ 
          backgroundColor: "#4285F4",
          color: "white"
        }}
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign in with Google"}
      </Button>
    </Box>
  );
};

export default Login;