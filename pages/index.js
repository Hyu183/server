import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Blockies from "react-blockies";
import {
  Avatar,
  Link,
  Grid,
  Paper,
  Typography,
  createTheme,
  ThemeProvider,
  CircularProgress,
  Skeleton,
  LinearProgress,
  Box,
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
  const [parameters, setParameters] = useState({
    softwareContractAdr: "",
    redirectURI: "",
  });
  // const { softwareContractAdr, redirectURI } = router.query;
  const [wallet, setWallet] = useState({
    email: "",
    address: "",
  });

  // let softwareContractAdr, redirectURI;

  useEffect(() => {
    if (!router.isReady) return;
    setParameters({
      softwareContractAdr: router.query.softwareContractAdr,
      redirectURI: router.query.redirectURI,
    });
    // softwareContractAdr = router.query.softwareContractAdr;
    // redirectURI = router.query.redirectURI;
    if (
      router.query.softwareContractAdr !== undefined &&
      router.query.redirectURI !== undefined
    ) {
      const web3 = new Web3(portis.provider);
      let softwareContract = null;
      try {
        softwareContract = new web3.eth.Contract(
          softwareContractABI,
          router.query.softwareContractAdr
        );
      } catch (error) {
        setError("Invalid software address");
        setLoading(false);
        console.log("Initial contract error: ", error);
        return;
      }

      const timeoutIds = [];
      portis.showPortis();
      function showPortisTimer() {
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
            setError("Login error");

            console.error("An error occurred:\n", err);
          });
      }
      showPortisTimer();

      if (
        softwareContract !== null &&
        softwareContract._address !== null &&
        error === null
      ) {
        portis.onLogin((walletAddress, email, reputation) => {
          setWallet({
            email,
            address: web3.utils.toChecksumAddress(walletAddress),
          });

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
              await fetch(router.query.redirectURI, {
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
      }
      return () => {
        for (let i = 0; i < timeoutIds.length; i++) {
          window.clearTimeout(timeoutIds[i]);
        }
      };
    } else {
      // router.push("/404");
      setLoading(false);
      setError("Invalid parameters");
    }
  }, [portis, router.isReady]);

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
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title} style={{ marginBottom: 50 }}>
            License Validator
          </h1>

          {loading ? (
            <Box sx={{ width: "100%" }}>
              <LinearProgress color="secondary" />
            </Box>
          ) : !error ? (
            <>
              {parameters.softwareContractAdr && (
                <>
                  <Typography variant="h4" color="common.white">
                    Software Address
                  </Typography>

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
                      {parameters.softwareContractAdr}
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
                                src={"/img/icons8-ok-96.png"}
                                height="30"
                                width="30"
                                alt=""
                              />
                            ) : (
                              <Image
                                src={"/img/icons8-cancel-48.png"}
                                height="30"
                                width="30"
                                alt=""
                              />
                            )
                          ) : (
                            <Box style={{ height: "30", width: "30" }}>
                              <CircularProgress color="secondary" />
                            </Box>
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
              <Box style={{ height: 50, marginTop: 30 }}>
                {!isChecking &&
                  (isValid ? (
                    <Typography variant="h4" color="green">
                      Now you can close this page and use your application.
                    </Typography>
                  ) : (
                    <Typography variant="h4" color="red">
                      You have no valid license.{" "}
                      <Link
                        href={`https://softwarelicenseblockchainmain.gtsb.io/?softwareAdr=${parameters.softwareContractAdr}`}
                        underline="always"
                      >
                        Click here to buy!
                      </Link>
                    </Typography>
                  ))}
              </Box>
            </>
          ) : (
            <Paper
              sx={{
                display: "flex",
                padding: "20px 70px",
                fontSize: 30,

                alignItems: "center",
                color: "rgb(95, 33, 32)",

                backgroundColor: "rgb(253, 237, 237)",
              }}
            >
              <Image
                src={"/img/icons8-high-priority-96.png"}
                height="60"
                width="60"
                alt=""
              />

              {` ERROR: ${error}`}
            </Paper>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
