import { Box, Button, TextField, Divider, Typography } from "@material-ui/core";
import { useState } from "react";
import { CryptoState } from "../../CryptoContext";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useEffect } from "react";

const Signup = ({ handleClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
            message: `Sign Up Successful. Welcome ${result.user.displayName || result.user.email}`,
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
    if (!email || !password || !confirmPassword) {
      setAlert({
        open: true,
        message: "Please fill all the Fields",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({
        open: true,
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    if (password.length < 6) {
      setAlert({
        open: true,
        message: "Password should be at least 6 characters",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setAlert({
        open: true,
        message: `Sign Up Successful. Welcome ${result.user.email}`,
        type: "success",
      });

      handleClose();
    } catch (error) {
      console.error("Sign-up Error:", error);
      
      let errorMessage = "Failed to create account";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email is already registered. Please use a different email or try logging in";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({
        open: true,
        message: errorMessage,
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
        message: `Sign Up Successful. Welcome ${result.user.displayName || result.user.email}`,
        type: "success",
      });

      handleClose();
    } catch (error) {
      console.error("Google Sign-Up Error:", error);
      
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
          console.error("Redirect sign-up error:", redirectError);
          
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
        let errorMessage = "Failed to sign up with Google";
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Sign-up was cancelled";
        } else if (error.code === 'auth/cancelled-popup-request') {
          errorMessage = "Sign-up request was cancelled";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
          errorMessage = "Account already exists with different sign-in method";
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
      <TextField
        variant="outlined"
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        disabled={loading}
      />
      <Button
        variant="contained"
        size="large"
        style={{ backgroundColor: "#EEBC1D" }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Sign Up"}
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
        {loading ? "Creating Account..." : "Sign up with Google"}
      </Button>
    </Box>
  );
};

export default Signup;