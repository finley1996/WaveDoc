const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 8009;

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 20;

mongoose
  .connect("mongodb://localhost:27017/document", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const Schema = mongoose.Schema;
const documentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  types: { type: String, required: true },
});
const Document = mongoose.model("Document", documentSchema);

// 解析请求体中的 JSON 数据
app.use(bodyParser.json());

// GET /documents：获取所有文档类型的数据
// 根据类型获取文档数据
app.get("/documents", async (req, res) => {
  const pageSize = req.query.pageSize || DEFAULT_PAGE_SIZE;
  const pageNumber = req.query.pageNumber || 1;
  console.log(req.query)
  try {
    const documents = await Document.find(
      req.query?.types ? { types: req.query?.types } : {}
    )
      .skip((pageNumber - 1) * pageSize)
      .limit(Math.min(pageSize, MAX_PAGE_SIZE))
      .exec();
    const total = await Document.countDocuments();
    res.json({
      data: documents,
      currentPage: pageNumber,
      total,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// POST /documents：添加一个新的文档类型的数据
app.post("/documents", async (req, res) => {
  const { title, content, types } = req.body;

  const document = new Document({ title, content, types });
  try {
    const newDocument = await document.save();
    res.status(201).json(newDocument);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
