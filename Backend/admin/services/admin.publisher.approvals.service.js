const repo = require("../repositories/admin.publisher.approvals.repository");

exports.list = ({ status, q, page, size }) =>
  repo.list({ status, q, page, size });

exports.setStatus = ({ employee_emailid, publisher_name, status }) =>
  repo.setStatus({ employee_emailid, publisher_name, status });

exports.setSectionStatus = ({ publisher_name, section, status }) =>
  repo.setSectionStatus({ publisher_name, section, status });
