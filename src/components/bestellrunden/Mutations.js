import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Stack, TextField, Autocomplete, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
const __ = wp.i18n.__

function Mutations({ id, setModalClose }) {
  const [products, setProducts] = useState()
  const [orders, setOrders] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState()
  const [ordersToChange, setOrdersToChange] = useState()
  const [priceAdjust, setPriceAdjust] = useState()
  const [mutationType, setMutationType] = useState(0)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getProductsOrdersInBestellrunde?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          let reArrangeProductData = []
          if (response.data) {
            const res = JSON.parse(response.data)
            console.log("res", res)

            Object.keys(res[1]).forEach(function (key, index) {
              let productToDo = {}
              productToDo.label = res[1][key].name + ", " + res[1][key].einheit
              productToDo.price = res[1][key].price
              productToDo.unit = res[1][key].einheit
              productToDo.id = key
              reArrangeProductData.push(productToDo)
            })

            setOrders(res[2])
            setProducts(reArrangeProductData)
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          setProductsLoading(false)
        })
    }
  }, [id])

  const handleSubmit = () => {
    setSubmitting(true)
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postSaveMutation`,
        {
          product: selectedProduct.id,
          orders: ordersToChange,
          mutation_type: mutationType,
          price: priceAdjust
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response) {
          console.log(response.data)
          setSuccess(true)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        setSubmitting(false)
        setModalClose(false)
      })
  }

  const handleChange = (event, newValue) => {
    setMutationType(newValue)
  }

  useEffect(() => {
    if (selectedProduct) {
      setOrdersToChange(orders[selectedProduct.id])
      setPriceAdjust(selectedProduct.price)
    }
  }, [selectedProduct])

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(null)
      }, 2000)
    }
  }, [success])

  return (
    <>
      <Dialog open={true} fullWidth scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle textAlign="left">
          {__("Neue Mutation in Bestellrunde", "fcplugin")} {id}
        </DialogTitle>
        <DialogContent
          sx={{
            paddingTop: "10px",
            minHeight: "500px"
          }}
        >
          {!productsLoading ? (
            <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
              <Autocomplete
                sx={{ width: "100%" }}
                onChange={(event, newValue) => {
                  setSelectedProduct(newValue)
                }}
                id="product"
                options={products}
                disablePortal
                renderInput={params => <TextField {...params} label={__("Produkt", "fcplugin")} className="autocompleteField" />}
              />

              <FormControl>
                <RadioGroup aria-labelledby="mutationType" name="mutationType" value={mutationType} onChange={e => setMutationType(e.target.value)}>
                  <FormControlLabel value="notDelivered" control={<Radio />} label={__("Produkt wurde nicht geliefert", "fcplugin")} disabled={!selectedProduct} />
                  <FormControlLabel value="priceAdjust" control={<Radio />} label={__("Preis anpassen", "fcplugin")} disabled={!selectedProduct} />
                </RadioGroup>
              </FormControl>

              {mutationType === "priceAdjust" && <TextField id="priceAdjust" value={priceAdjust} onChange={e => setPriceAdjust(e.target.value)} variant="outlined" type="number" sc={{ paddingTop: "5px", paddingBottom: "5px" }} />}

              {ordersToChange && (
                <div>
                  {__("Betroffene Bestellungen", "fcplugin")}: <br />
                  {ordersToChange.map(order => (
                    <React.Fragment key={order[0]}>
                      <a target="blank" href={`${appLocalizer.homeUrl}/wp-admin/post.php?post=${order[0]}&action=edit`} style={{ display: "inline-block" }}>
                        {order[0] + " - " + order[1]}
                      </a>
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              )}
              {success && <Alert severity="success">{__("Mutation wurde verarbeitet.", "fcplugin")}</Alert>}
            </Stack>
          ) : (
            <Box sx={{ width: "100%", paddingTop: "20px", display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
            {__("Mutation speichern", "fcplugin")}
          </LoadingButton>
          <Button
            onClick={() => {
              setModalClose(false)
              setProductsLoading(true)
              setProducts(null)
            }}
          >
            {__("Schliessen", "fcplugin")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Mutations
