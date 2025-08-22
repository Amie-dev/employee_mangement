const asyncHAndler = (requestFunction) => {
  return (req, res, next) => {
    Promise.resolve(requestFunction(req, res, next)).catch((e) => next(e));
  };
};

export default asyncHAndler;
