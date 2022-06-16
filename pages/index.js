import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Blockies from "react-blockies";
import {
  Avatar,
  Grid,
  Paper,
  Typography,
  createTheme,
  ThemeProvider,
  CircularProgress,
  Skeleton,
  LinearProgress,
  Box,
  TextField,
} from "@mui/material";
import Web3 from "web3";
import softwareContractABI from "../abi/SoftwareTest.json";

import { portis } from "../src/portis/portis";

const theme = createTheme({
  typography: {
    fontFamily: [
      "EuclidCircularBMedium",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});

//0xe90E628AB0A5c45592cfF1F09E1BDAEfd278915f
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { softwareContractAdr, redirectURI } = router.query;
  const [wallet, setWallet] = useState({ email: "", address: "" });
  // console.log("Request: ,", req);

  useEffect(() => {
    const timeoutIds = [];
    portis.showPortis();
    function showPortisTimer() {
      console.log("Show portis function");
      portis
        .isLoggedIn()
        .then((res) => {
          if (res.result === false) {
            setLoading(true);
            portis.showPortis();
            timeoutIds.push(setTimeout(showPortisTimer, 1000));
          } else {
            setLoading(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.error("An error occured:\n", error);
        });
    }
    showPortisTimer();
    const web3 = new Web3(portis.provider);
    let softwareContract = null;
    try {
      console.log("software Address: ", softwareContractAdr);
      softwareContract = new web3.eth.Contract(
        softwareContractABI,
        softwareContractAdr
      );
    } catch (error) {
      console.error(error);
    }

    console.log(softwareContract);
    portis.onLogin((walletAddress, email, reputation) => {
      setWallet({
        email,
        address: web3.utils.toChecksumAddress(walletAddress),
      });
      if (softwareContract === null) {
        return;
      }

      // let message = '';
      console.log("Logged in, with address:", walletAddress);
      // signedMessage = '';
      setIsChecking(true);
      softwareContract.methods
        .check_license_v2()
        .call({ from: walletAddress })
        .then(async (isAdrValid) => {
          if (isAdrValid) {
            setIsValid(true);
          } else {
            setIsValid(false);
          }
          setIsChecking(false);
          await fetch(redirectURI, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_valid: isAdrValid }),
          })
            .then((res) => console.log(res))
            .catch((err) => {
              console.log("FETCH ERR: ", err);
            });
        })
        .catch((error) => {
          console.error("An error ocurred:\n", error);
        });
    });
    return () => {
      for (let i = 0; i < timeoutIds.length; i++) {
        window.clearTimeout(timeoutIds[i]);
      }
    };
  }, [softwareContractAdr, portis]);

  return (
    <ThemeProvider theme={theme}>
      <div
        className={styles.container}
        style={{ backgroundImage: "url(/img/banner-bg.jpg)" }}
      >
        <Head>
          <title>License Validator</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
          {/* <link
          href="../asset/EuclidCircularBMedium/EuclidCircularB-Medium.ttf"
          rel="stylesheet"
        /> */}
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title} style={{ marginBottom: 50 }}>
            License Validator
          </h1>

          {loading ? (
            // <p>Loading...</p>
            // <CircularProgress color="primary" />
            <Box sx={{ width: "100%" }}>
              <LinearProgress color="secondary" />
            </Box>
          ) : (
            <>
              {softwareContractAdr && (
                <>
                  <Typography variant="h4" color="common.white">
                    Software Address
                  </Typography>
                  {/* <Typography color="common.white">
                    {softwareContractAdr}
                  </Typography> */}
                  {/* <TextField
                    id="filled-read-only-input"
                    // label="Read Only"
                    defaultValue={softwareContractAdr}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="filled"
                  /> */}
                  <Box
                    style={{
                      border: "1px solid grey",
                      borderRadius: "16px",
                      padding: 15,
                      marginTop: 10,
                      background:
                        "linear-gradient(32.93deg,hsla(0,0%,98%,.1) -19.03%,hsla(0,0%,100%,.1) 49.78%,hsla(0,0%,86%,.1))",
                    }}
                  >
                    <p style={{ padding: 0, margin: 0, color: "white" }}>
                      {softwareContractAdr}
                    </p>
                  </Box>
                </>
              )}
              {wallet.email !== "" ? (
                <>
                  <Paper
                    style={{
                      backgroundImage:
                        "linear-gradient(to right bottom, #6a5af9, #f62682)",
                      height: 200,
                      width: 700,
                      borderRadius: "16px",
                      padding: 3,
                      marginTop: 30,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 4,
                        margin: "auto",
                        borderRadius: "inherit",
                        // flexGrow: 1,
                        backgroundColor: "rgb(44 44 57)",
                      }}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <Grid container spacing={2}>
                        <Grid item>
                          <Avatar sx={{ width: 120, height: 120 }}>
                            <Blockies
                              size={30}
                              seed={wallet.address.toLowerCase()}
                            />
                          </Avatar>
                        </Grid>
                        <Grid item xs={12} sm container direction="column">
                          <Grid item xs>
                            <Typography variant="h4" color="common.white">
                              {wallet.email}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography color="blue">
                              {wallet.address}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid item xs="auto" style={{ alignSelf: "center" }}>
                          {!isChecking ? (
                            isValid ? (
                              <Image
                                src={"/img/valid.png"}
                                height="30"
                                width="30"
                              />
                            ) : (
                              <Image
                                src={"/img/invalid.png"}
                                height="30"
                                width="30"
                              />
                            )
                          ) : (
                            <Box style={{ height: "30", width: "30" }}>
                              <CircularProgress color="secondary" />
                            </Box>
                            // <button
                            //   style={{ height: "30", width: "30" }}
                            //   hidden
                            // ></button>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  </Paper>
                </>
              ) : (
                <Skeleton
                  variant="rectangular"
                  width={700}
                  height={200}
                  style={{
                    borderRadius: "16px",
                    marginTop: 30,
                    background:
                      "linear-gradient(32.93deg,hsla(0,0%,98%,.1) -19.03%,hsla(0,0%,100%,.1) 49.78%,hsla(0,0%,86%,.1))",
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
