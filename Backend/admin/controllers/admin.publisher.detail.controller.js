const svc = require("../services/admin.publisher.detail.service");

exports.getOne = async (req, res, next) => {
  try {
    const { publisherName } = req.params;
    const data = await svc.getOne({ publisherName });
    if (!data)
      return res
        .status(404)
        .json({ ok: false, message: "Publisher not found" });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};
