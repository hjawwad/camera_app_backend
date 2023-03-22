require("./models/Image");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config({});

const mongoUri = process.env.URL;
const Port = process.env.PORT;

const Image = mongoose.model("Image");

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

app.use(cors({ origin: "*" }));

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

mongoose.connect(mongoUri);

mongoose.connection.on("connected", () => {
  console.log("DB connected");
});

app.post("/uploadImage", async (req, res) => {
  try {
    const { image } = req.body;

    const file = "data:image/jpg;base64," + image.base64;
    const name = image.uri.split("/").pop();

    console.log(name);

    const result = await cloudinary.uploader.upload(file, {
      folder: "Camera_App",
      public_id: name,
      overwrite: true,
    });
    console.log("---------------->", result);

    try {
      const img = new Image({
        url: result.url,
        name: result.public_id,
      });

      await img.save();
      res.status(201).send(img);
    } catch (error) {
      res.send(500).send("Image is not saved in database");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading image to Cloudinary");
  }
});

app.listen(Port || 5000, () => {
  console.log("Listining to port " + Port);
});
