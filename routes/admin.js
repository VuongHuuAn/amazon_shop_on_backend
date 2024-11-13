const express = require("express");
const adminRouter = express.Router();
const admin = require("../middlewares/admin");
const { Product } = require("../models/product");
const Order = require("../models/order");
const { PromiseProvider } = require("mongoose");
adminRouter.post("/admin/add-product", admin, async (req, res) => {
  console.log("Request received for add-product:", req.body);
  try {
    const { name, description, price, quantity, category, images } = req.body;
    let product = new Product({
      name,
      description,
      price,
      quantity,
      category,
      images,
    });
    product = await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get("/admin/get-products", admin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//delete product
adminRouter.post("/admin/delete-product", admin, async (req, res) => {
  try {
    const { id } = req.body;
    let product = await Product.findByIdAndDelete(id);

    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get("/admin/get-orders", admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.post("/admin/change-order-status", admin, async (req, res) => {
  try {
    const { id, status } = req.body;
    let order = await Order.findById(id);
    order.status = status;
    order = await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get("/admin/analytics", admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    let totalEarnings = 0;
    const categoryEarnings = {
      Mobiles: 0,
      Essentials: 0,
      Appliances: 0,
      Books: 0,
      Fashion: 0,
    };

    // Tính toán doanh thu cho từng danh mục và tổng doanh thu
    orders.forEach((order) => {
      order.products.forEach((item) => {
        const earnings = item.quantity * item.product.price;
        const category = item.product.category;

        // Cộng vào tổng doanh thu
        totalEarnings += earnings;

        // Cộng vào doanh thu theo danh mục
        if (category in categoryEarnings) {
          categoryEarnings[category] += earnings;
        }
      });
    });

    // Chuẩn bị dữ liệu trả về theo format cũ
    const earnings = {
      totalEarnings,
      mobileEarnings: categoryEarnings.Mobiles,
      essentialEarnings: categoryEarnings.Essentials,
      applianceEarnings: categoryEarnings.Appliances,
      booksEarnings: categoryEarnings.Books,
      fashionEarnings: categoryEarnings.Fashion,
    };

    // Log để debug
    console.log("Analytics:", earnings);

    res.json(earnings);
  } catch (e) {
    console.error("Error in analytics:", e);
    res.status(500).json({ error: e.message });
  }
});
module.exports = adminRouter;
