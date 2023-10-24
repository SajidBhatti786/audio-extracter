const path = require("path"); // This import is required

module.exports = {
  // Other webpack configuration settings go here

  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },
};
