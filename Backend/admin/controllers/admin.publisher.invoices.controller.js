const service = require("../services/admin.publisher.invoices.service");

exports.list = async (req, res, next) => {
  try {
    const {
      publisher_name,
      month,
      year,
      invoice_status,
      page = 1,
      limit = 20,
    } = req.query;

    const result = await service.list({
      publisher_name,
      month,
      year,
      invoice_status,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({ success: true, ...result }); // matches user-side JSON style
  } catch (err) {
    next(err);
  }
};
