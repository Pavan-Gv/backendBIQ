module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      // Handle the error
      next(err);
    });
  };
}
