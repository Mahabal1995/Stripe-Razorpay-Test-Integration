import React from "react";
import axios from "axios";
import Button from "@mui/material/Button";

interface ButtonProps {
  amount: number;
}

const RazorPayButtonComponent: React.FC<ButtonProps> = ({ amount }) => {
  interface RazorpayData {
    amount: string;
    currency: string;
    id: string;
  }

  const handleOpenRazorpay = (data: RazorpayData) => {
    const options = {
      key: "rzp_test_9e9h7K87g5yKdi",
      amount: Number(data.amount),
      currency: data.currency,
      order_id: data.id,
      name: "SHOPPING APP",
      description: "XYZ",
      handler: function (response: any) {
        console.log(response, "34");
        axios
          .post("http://localhost:8000/api/verify", { response: response })
          .then((res) => {
            console.log(res, "37");
            // your orders
          })
          .catch((err) => {
            console.log(err);
          });
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePayment = () => {
    const _data = { amount: amount };

    axios
      .post("http://localhost:8000/api/orders", _data)
      .then((res) => {
        console.log(res.data, "29");
        handleOpenRazorpay(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Button onClick={handlePayment} variant="contained" color="primary">
      Pay Now Using Razor Pay
    </Button>
  );
};

export default RazorPayButtonComponent;
