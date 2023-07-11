const cors = require("cors");
const express = require("express");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Razorpay = require("razorpay");
var crypto = require("crypto");

// Razorpay secret keys
const KEY_ID = "rzp_test_a0EvkgbyNeWn0A";
const KEY_SECRET = "jyFRn1SrKIK7dAqvwsLj1w2R";

const app = express();

// Middlewares here
app.use(express.json());
app.use(cors());

// Routes here
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/create-checkout-session", async (req, res) => {
  const { product } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: { name: product.name },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  res.json({ id: session.id });
});

app.post("/api/orders", async (req, res) => {
  console.log("Entered into orders");
  let instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

  var options = {
    amount: req.body.amount * 100, // amount in the smallest currency unit
    currency: "INR",
  };

  // Creating Orders of Razorpay
  instance.orders.create(options, function (err, order) {
    if (err) {
      return res.send({ code: 500, message: "Server Err." });
    }
    return res.send({ code: 200, message: "order created", data: order });
  });
});

app.post("/api/verify", (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  var expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === req.body.response.razorpay_signature) {
    res.send({ code: 200, message: "Sign Valid" });
  } else {
    res.send({ code: 500, message: "Sign Invalid" });
  }
});

// Listen
app.listen(8000, () => {
  console.log("Server started at port 8000");
});
