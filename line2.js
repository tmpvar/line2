if (typeof require !== 'undefined') {
  var Vec2 = require('vec2');
  var segseg = require('segseg');
}

var isArray = function (a) {
  return Object.prototype.toString.call(a) === "[object Array]";
};

var defined = function(a) {
  return typeof a !== 'undefined';
};

var finite = function(a) {
  return a !== Infinity && a !== -Infinity;
};

function Line2(slope, yintercept, x2, y2) {

  if (!(this instanceof Line2)) {
    return new Line2(slope, yintercept, x2, y2);
  }

  if (defined(x2) && defined(y2)) {
    return Line2.fromPoints(slope, yintercept, x2, y2);

  } else {
    if (defined(slope)) {
      this.slope(slope);
    }

    if (defined(yintercept)) {
      this.yintercept(yintercept);
    }
  }
}

Line2.prototype.yintercept = function(val) {

  if (val) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    this._yintercept = val;
  }
  return this._yintercept || 0;
}

Line2.prototype.xintercept = function(val) {

  if (val) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    this._xintercept = val;
  }
  return this._xintercept || 0;
}

Line2.prototype.slope = function(val) {
  if (val) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    this._slope = val;
  }
  return this._slope || 0;
};

Line2.prototype.intersectSegment = function(x1, y1, x2, y2) {

  var dx = x2 - x1;
  var dy = y2 - y1;
  var lx1, ly1, lx2, ly2;
  var horizontal = this.isHorizontal();
  var vertical = this.isVertical();

  // vertical
  if (dx === 0) {
    if (vertical) {
      return x1 === this.xintercept();
    }

  // horizontal
  } else if (dy === 0) {
    // parallel
    if (horizontal) {
      return y1 === this.yintercept();
    }

  // diagonal
  } else {
    if (dy/dx === this.slope()) {
      return y1 === this.slope() * x1 + this.yintercept()
    }
  }

  if (x1 > x2) {
    lx1 = x2-10;
    lx2 = x1+10;
  } else {
    lx1 = x1-10;
    lx2 = x2+10;
  }

  var isect;
  if (this.isHorizontal()) {
    y = this.yintercept();
    isect = segseg(lx1, y, lx2, y, x1, y1, x2, y2);
  } else if (this.isVertical()) {
    if (y1 > y2) {
      ly1 = y2-10;
      ly2 = y1+10;
    } else {
      ly1 = y1-10;
      ly2 = y2+10;
    }
    var x = this.xintercept();

    isect = segseg(x, ly1, x, ly2, x1, y1, x2, y2);
  } else {
    ly1 = this.slope() * lx1 + this.yintercept();
    ly2 = this.slope() * lx2 + this.yintercept();
    isect = segseg(lx1, ly1, lx2, ly2, x1, y1, x2, y2);
  }

  if (isect && isect !== true) {
    return Vec2.fromArray(isect);
  }

  return isect;
};

Line2.prototype.intersect = function(line, y1, x2, y2) {

  if ((defined(x2) && defined(y2)) || defined(line.end)) {
    return this.intersectSegment(line, y1, x2, y2);
  }

  var s1 = this.slope();
  var s2 = line.slope();

  // Parallel lines
  if (s1 === s2) {
    return (this.yintercept() === line.yintercept() &&
            this.xintercept() === line.xintercept());
  }

  var fs1 = finite(s1);
  var fs2 = finite(s2);
  var yi1 = this.yintercept();
  var yi2 = line.yintercept();
  var x;

  if (fs1 && fs2) {
    var yi = yi1 + yi2;
    var si = s1 - s2;
    x = yi/si;
    return Vec2(x, s1*x + yi1);

  } else {
    var slope, yi, x = this.xintercept() || line.xintercept();
    if (!fs1) {
      slope = s2;
      yi = yi2;
    } else {
      slope = s1;
      yi = yi1;
    }

    // Diagonal line
    if (slope !== 0) {
      return Vec2(x, x*slope + yi);

    // Horizonal line
    } else {
      return Vec2(x, yi);
    }
  }
};

Line2.fromPoints = function(x1, y1, x2, y2) {

  if (isArray(y1)) {
    y2 = y1[1];
    x2 = y1[0];
  } else if (defined(y1) && defined(y1.x) && defined(y1.y)) {
    y2 = y1.y;
    x2 = y1.x;
  }

  if (isArray(x1)) {
    y1 = x1[1];
    x1 = x1[0];
  } else if (defined(x1) && defined(x1.x) && defined(x1.y)) {
    y1 = x1.y;
    x1 = x1.x;
  }

  var line = new Line2();
  var slope = (y2 - y1) / (x2 - x1);

  line.slope(slope);
  line.yintercept(y1 - line.slope() * x1);

  if (!finite(slope)) {
    line.xintercept(x2);
  }

  return line;
};

Line2.prototype.isHorizontal = function() {
  return this.slope() === 0;
};

Line2.prototype.isVertical = function() {
  return !finite(this.slope());
};

Line2.prototype.closestPointTo = function(vec) {
  var yi = this.yintercept();
  var xi = this.xintercept();
  var s = this.slope();

  if (this.isHorizontal()) {
    return Vec2(vec.x, yi);
  } else if (this.isVertical()) {
    return Vec2(xi, vec.y);
  } else {
    var line = Line2.fromPoints(vec.x, vec.y, vec.x+s, vec.y-s);
    return this.intersect(line);
  }
};

Line2.prototype.containsPoint = function(vec, y) {
  var x = vec;
  if (!defined(y)) {
    y = vec.y;
    x = vec.x;
  }

  if (this.isHorizontal()) {
    return y === this.yintercept();
  } else if (this.isVertical()) {
    return x === this.xintercept();
  } else {
    return y === this.slope() * x + this.yintercept();
  }
};


if (typeof module !== "undefined" && typeof module.exports == "object") {
  module.exports = Line2;
}

if (typeof window !== "undefined") {
  window.line2 = window.line2 || line2;
}