require("dotenv").config();

const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const ImageSchema = new Schema({
  name: { type: String },
  description: { type: String },
  rating: {
    type: Number,
    default: 600,
  },
  url: { type: String },
});
const ImageData = mongoose.model("Image", ImageSchema);

module.exports = ImageData;
