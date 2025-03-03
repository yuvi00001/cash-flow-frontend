import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "@mui/joy/Table";
import TextField from '@mui/material/TextField';

const TransactionsApp = (props) => {
  const [companyID, setCompanyID] = useState("123456"); // default
  const [transactionsData, setTransactions] = useState([]);
  const [showStatement, setShowStatement] = useState(true);
  const [previousBalanceState, setPreviousBalanceState] = useState(0);
  const [debitAmount, setDebitAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);

  const headers = [
    "createdAt",
    "description",
    "credit",
    "debit",
    "runningBalance",
  ];

  const headersMapping = {
    createdAt: "Date",
    description: "Description",
    credit: "Credit",
    debit: "Debit",
    runningBalance: "Balance",
  };

  const BACKEND_URL = "http://localhost:4000/base";

  useEffect(() => {
    apiToFetchCompanyTransactions(companyID);
  }, [companyID]);

  const apiToFetchCompanyTransactions = async (companyIDString) => {
    const response = await axios
      .get(`${BACKEND_URL}/get-all?companyID=${companyIDString}`)
      .then((resp) => {
        console.log("t data ", resp.data)
        if (resp.data && resp.data.response) {
            return resp.data.transactions
        } else {
            return []
        }
      })
      .catch((error) => {
        console.log("error - get ", error);
        return [];
      });

      if (response.length > 0) {
        setPreviousBalanceState(response[0].runningBalance)
      }

      setTransactions([...response])
  };

  const makeTransaction = async () => {
    const debit = debitAmount;
    const previousBalance = previousBalanceState;
    const credit = creditAmount;

    if (debit > previousBalance) {
        return;
    }

    const newBalance = previousBalance - debit + credit;

    const response = await axios.post(`${BACKEND_URL}/create`, {
        companyID: companyID,
        debit: debit,
        credit: credit,
        companyName: "AB",
        description: "transaction",
        balance: newBalance
    }).then((resp) => {

        console.log("resp ", resp.data)
        if (resp.data && resp.data.response) {
            return true
        } else {
            return false
        }
    }).catch((error) => {
        console.error("axios p ", error)
        return null
    });

    setCreditAmount(0);
    setDebitAmount(0);

    if (response) {apiToFetchCompanyTransactions(companyID)}
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div
        style={{
          height: "200px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>Transactions</h1>
      </div>

      <div
        className="main-body"
        style={{
          height: "calc(100% - 200px)",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="toggle"
          style={{
            height: "100px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Button variant="contained" color="primary">
            Statement
          </Button>
          <Button variant="contained" color="primary" onClick={() => {
            makeTransaction()
          }}>
            Make Transaction
          </Button>
        </div>

        <div style={{
            height: "100px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
        }}>
            <TextField id="outlined-basic" label="Debit Amount" variant="outlined" value={debitAmount} onChange={(e) => {
                if (e.target.value) {
                    setDebitAmount(parseInt(e.target.value))
                }
            }} />
            <TextField id="outlined-basic" label="Credit Amount" variant="outlined" value={creditAmount} onChange={(e) => {
                if (e.target.value) {
                    setCreditAmount(parseInt(e.target.value))
                }
            }}/>
        </div>

        <div
          className="content-body"
          style={{
            height: "calc(100% - 200px)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {showStatement ? (
            <Table aria-label="basic table">
              <thead>
                <tr>
                  {headers.map((value, index) => (
                    <th key={index}>{headersMapping[value]}</th>
                  ))}
                  {/* <th style={{ width: "40%" }}>Dessert (100g serving)</th>
                  <th>Calories</th>
                  <th>Fat&nbsp;(g)</th>
                  <th>Carbs&nbsp;(g)</th>
                  <th>Protein&nbsp;(g)</th> */}
                </tr>
              </thead>
              <tbody>
                {transactionsData.map((value, index) => (
                  <tr key={index}>
                    {headers.map((headerIndex, index) => (
                        <td key={index}>{headerIndex === "createdAt" ? value[headerIndex].split("T")[0] : value[headerIndex]}</td>
                    ))}
                   
                  </tr>
                ))}
                
              </tbody>
            </Table>
          ) : (
            <div className="make-transaction" style={{
                height: "400px",
                width: "500px",
                display: "flex"
            }}>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsApp;
