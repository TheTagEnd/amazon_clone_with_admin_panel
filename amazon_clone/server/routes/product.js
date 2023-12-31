const express = require("express");
const productRouter = express.Router();
const { Product } = require("../models/product");
const auth = require("../middlewares/auth");

productRouter.get("/api/products", auth, async (req, res) => {
  try {
    console.log(req.query.category);
    const products = await Product.find({ category: req.query.category });
    res.json(products);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

productRouter.get("/api/products/search/:name", auth, async (req, res) => {
  try {
    const products = await Product.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, rating } = req.body;
    let product = await Product.findById(id);

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }

    const ratingSchema = {
      userId: req.user,
      rating,
    };

    product.ratings.push(ratingSchema);
    product = await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  productRouter.get("/api/deal-of-day", auth, async (req, res) => {
    try {
      let products = await Product.find({});
      products = products.sort((a, b) => {
        let sum1 = 0;
        let sum2 = 0;
        for (let i = 0; i < a.ratings.length; i++) {
          sum1 += a.rating[i].rating;
        }
        for (let i = 0; i < b.ratings.length; i++) {
          sum2 += b.rating[i].rating;
        }
        return sum1 < sum2 ? 1 : -1;
      });
      res.json(products[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

module.exports = productRouter;
