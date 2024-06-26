import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { productCategories } from "../constants/general.constants";
import addProductValidationSchema from "../validationSchema/add.product.validation.schema";
import { $axios } from "../axios/axiosInstance";
import Loader from "../components/Loader";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  openErrorSnackbar,
  openSuccessSnackbar,
} from "../store/slices/snackbarSlice";

const AddProduct = () => {
  const dispatch = useDispatch();
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const [productImage, setProductImage] = useState(null);
  const [localUrl, setLocalUrl] = useState("");
  const [imageUploadLoading, setimageUploadLoading] = useState(false);
  const navigate = useNavigate();
  const { isPending, mutate } = useMutation({
    mutationKey: ["add-product"],
    mutationFn: async (values) => {
      return await $axios.post("/product/add", values);
    },
    onSuccess: (res) => {
      navigate("/products");
      dispatch(openSuccessSnackbar(res?.data?.message));
    },
    onError: (error) => {
      dispatch(openErrorSnackbar(error?.response?.data?.message));
    },
  });

  if (isPending || imageUploadLoading) {
    return <Loader />;
  }

  return (
    <>
      <Box>
        <Formik
          initialValues={{
            image: null,
            name: "",
            brand: "",
            price: 0,
            availableQuantity: 1,
            freeShipping: false,
            category: "",
            description: "",
          }}
          validationSchema={addProductValidationSchema}
          onSubmit={async (values) => {
            let imageUrl = null;
            if (productImage) {
              const data = new FormData();
              data.append("file", productImage);
              data.append("upload_preset", uploadPreset);
              data.append("cloud_name", cloudName);
              try {
                setimageUploadLoading(true);
                const response = await axios.post(
                  `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                  data
                );
                imageUrl = response?.data?.secure_url;
                setimageUploadLoading(false);
              } catch (error) {
                setimageUploadLoading(false);
                console.log(error.message);
              }
            }
            values.image = imageUrl;
            mutate(values);
          }}
        >
          {(formik) => (
            <form
              onSubmit={formik.handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "center",
                padding: "1rem",
                gap: "1rem",
                width: "450px",
                boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
              }}
            >
              <Typography variant="h5">Add Product</Typography>
              {localUrl && (
                <Stack sx={{ height: "250px" }}>
                  <img src={localUrl} alt="" height="100%" width="100%" />
                </Stack>
              )}
              <FormControl>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setProductImage(file);
                    setLocalUrl(URL.createObjectURL(file));
                  }}
                />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  label="Name"
                  {...formik.getFieldProps("name")}
                  required
                />

                {formik.touched.name && formik.errors.name ? (
                  <FormHelperText error>{formik.errors.name}</FormHelperText>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  label="Brand"
                  {...formik.getFieldProps("brand")}
                  required
                />

                {formik.touched.brand && formik.errors.brand ? (
                  <FormHelperText error>{formik.errors.brand}</FormHelperText>
                ) : null}
              </FormControl>
              {/* <FormControl fullWidth>
                <TextField
                  label="Price"
                  {...formik.getFieldProps("price")}
                  type="number"
                  required
                />

                {formik.touched.price && formik.errors.price ? (
                  <FormHelperText error>{formik.errors.price}</FormHelperText>
                ) : null}
              </FormControl> */}
              <FormControl fullWidth>
                <InputLabel>Price</InputLabel>
                <OutlinedInput
                  startAdornment={
                    <InputAdornment position="start">Rs.</InputAdornment>
                  }
                  label="Price"
                  type="number"
                  {...formik.getFieldProps("price")}
                />
                {formik.touched.price && formik.errors.price ? (
                  <FormHelperText error>{formik.errors.price}</FormHelperText>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  label="Quantity"
                  {...formik.getFieldProps("availableQuantity")}
                  type="number"
                  required
                />

                {formik.touched.availableQuantity &&
                formik.errors.availableQuantity ? (
                  <FormHelperText error>
                    {formik.errors.availableQuantity}
                  </FormHelperText>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Checkbox {...formik.getFieldProps("freeShipping")} />
                  }
                  label="Free Shipping"
                />
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select label="Category" {...formik.getFieldProps("category")}>
                  {productCategories.map((item, index) => {
                    return (
                      <MenuItem key={index} value={item}>
                        {item}
                      </MenuItem>
                    );
                  })}
                </Select>

                {formik.touched.category && formik.errors.category ? (
                  <FormHelperText error>
                    {formik.errors.category}
                  </FormHelperText>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  required
                  multiline
                  rows={4}
                  label="Description"
                  {...formik.getFieldProps("description")}
                />
                {formik.touched.description && formik.errors.description ? (
                  <FormHelperText error>
                    {formik.errors.description}
                  </FormHelperText>
                ) : null}
              </FormControl>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="success"
              >
                Submit
              </Button>
            </form>
          )}
        </Formik>
      </Box>
    </>
  );
};

export default AddProduct;
