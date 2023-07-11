import React from "react";
import { Button } from "@mui/material";
import { loadStripe, Stripe } from "@stripe/stripe-js";
const StripePayButtonComponent: React.FC = () => {
  interface Product {
    name: string;
    price: number;
    productOwner: string;
    description: string;
    quantity: number;
  }

  const product: Product = {
    name: "Go FullStack with KnowledgeHut",
    price: 1000,
    productOwner: "KnowledgeHut",
    description:
      "This beginner-friendly Full-Stack Web Development Course is offered online in blended learning mode, and also in an on-demand self-paced format.",
    quantity: 1,
  };

  const makePayment = async (): Promise<void> => {
    const stripe: Stripe | null = await loadStripe(
      "pk_test_51NSYNbSINsvAMxtChRKzlvrVwL82mpKKgkxWaqvbxcgrkKtVN5Yl99FxJy06vWpO4cC6Mq2Whenv7L5utFwXqYpW009RftxnhA"
    );
    const body = { product };
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(
      "http://localhost:8000/api/create-checkout-session",
      { method: "POST", headers: headers, body: JSON.stringify(body) }
    );
    const session = await response.json();
    const result = await stripe?.redirectToCheckout({ sessionId: session.id });
    if (result?.error) {
      console.log(result.error);
    }
  };

  return (
    <Button onClick={makePayment} variant="contained" color="primary">
      Pay Now Using Stripe
    </Button>
  );
};
export default StripePayButtonComponent;
