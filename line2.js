var line2 = function() {

}


if (typeof module !== "undefined" && typeof module.exports == "object") {
  module.exports = line2;
}

if (typeof window !== "undefined") {
  window.line2 = window.line2 || line2;
}

module.exports = Line2