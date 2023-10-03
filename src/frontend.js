import React from "react"
import ReactDOM from "react-dom"
import FrontendApp from "./FrontendApp"
import QRBill from "./QRBill"
import AddToCart from "./AddToCart"

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_topup")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<QRBill />, document.getElementById("fc_topup"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_order_list")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<FrontendApp />, document.getElementById("fc_order_list"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_add_to_cart")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<AddToCart />, document.getElementById("fc_add_to_cart"))
  }
})
