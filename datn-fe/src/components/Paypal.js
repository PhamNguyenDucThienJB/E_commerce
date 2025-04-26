import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Paypal = () => {
  return (
    <div className="col-4 offset-4 mt-5">
      <PayPalScriptProvider>
        <PayPalButtons></PayPalButtons>
      </PayPalScriptProvider>
    </div>
  );
};

export default Paypal;
