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

var definedOr = function(a, defaultValue) {
  return defined(a) ? a : defaultValue;
};

var finite = function(a) {
  return a !== Infinity && a !== -Infinity;
};

var det = function(x1, y1, x2, y2) {
  return x1*y2 - y1*x2;
};

function Line2(slope, yintercept, x2, y2) {

  this._listeners = [];

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

Line2.prototype._yintercept = null;
Line2.prototype._xintercept = null;
Line2.prototype._slope = null;

Line2.prototype.change = function(fn) {
  if (typeof fn === 'function') {
    this._listeners.push(fn);
    return fn;
  }
};

Line2.prototype.ignore = function(fn) {
  if (!fn) {
    this._listeners = [];
  } else {
    this._listeners = this._listeners.filter(function(a) {
      return a !== fn;
    });
  }
};

Line2.prototype.notify = function(fn) {
  var fns = this._listeners, l = fns.length;
  for (var i = 0; i<l; i++) {
    fns[i](this);
  }
};

Line2.prototype.yintercept = function(val) {

  if (defined(val)) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    if (this._yintercept !== val) {
      this._yintercept = val;

      if (!this.isHorizontal()) {
        this._xintercept = this.solveForX(0);
      }

      this.notify();
    }
  }
  return definedOr(this._yintercept, null);
};

Line2.prototype.xintercept = function(val) {

  if (defined(val)) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    if (this._xintercept !== val) {
      if (!this.isVertical()) {

        var diff =  this._xintercept - val;
        this._yintercept -= (diff * -this._slope);
      }

      this._xintercept = val;
      this.notify();
    }
  }
  return definedOr(this._xintercept, null);
};

Line2.prototype.slope = function(val) {
  if (defined(val)) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    if (this._slope !== val) {
      var old = this._slope;
      this._slope = val;

      if (old !== null) {
        var x = this.solveForX(0);
        if (!finite(x)) {
          x = null;
        }

        this._xintercept = x;
      }
      this.notify();
    }
  }
  return definedOr(this._slope, null);
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
      return y1 === this.solveForY(x1);
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
    ly1 = this.solveForY(lx1);
    ly2 = this.solveForY(lx2);
    isect = segseg(lx1, ly1, lx2, ly2, x1, y1, x2, y2);
  }

  if (isect && isect !== true) {
    return Vec2.fromArray(isect);
  }

  return isect;
};

Line2.prototype.createPerpendicular = function(vec) {
  if (this.isVertical()) {
    return new Line2(0, vec.y);
  } else if (this.isHorizontal()) {
    var l = new Line2();
    l.xintercept(vec.x);
    l.slope(Infinity);
    return l;
  } else {
    var perpSlope = -1/this.slope();
    return new Line2(perpSlope, vec.y - perpSlope * vec.x);
  }
};

Line2.prototype.intersectCircle = function(vec, radius) {

  var r2 = radius*radius,
      slope = this.slope(),
      yintercept = this.yintercept(),
      f, g, v1, v2;

  if (this.isHorizontal()) {
    f = 1;
    g = 0;
  } else if (this.isVertical()) {
    slope = radius;
    yintercept = r2;
    f = 0;
    g = slope;
  } else {
    f = 1/slope;
    g = 1;
  }

  var x0 = (this.isVertical()) ? this.xintercept() : 1;
  var y0 = yintercept + slope;
  var f2 = f*f;
  var g2 = g*g;

  var tmp = f * (vec.y - y0) - g * (vec.x - x0);
  tmp *= tmp;
  var den = f2 + g2;
  var discriminant = Math.sqrt(r2 * (f2 + g2) - tmp);

  // no intersection
  if (isNaN(discriminant)) {
    return [];
  }

  discriminant /= den;

  var num = f * (vec.x - x0) + g * (vec.y - y0);
  var t1 = num/den + discriminant;
  var t2 = num/den - discriminant;

  v1 = new Vec2(x0 + t1*f, y0 + t1*g);
  v2 = new Vec2(x0 + t2*f, y0 + t2*g);

  var ret = [v1];
  if (!v1.equal(v2)) {
    ret.push(v2);
  }

  return ret;
};

Line2.prototype.solveForX = function(y) {
  if (this.isVertical()) {
    return this.xintercept();
  } else {
    return (y - this.yintercept()) / this.slope();
  }
};

Line2.prototype.solveForY = function(x) {
  if (this.isHorizontal()) {
    return this.yintercept();
  } else {
    return this.slope() * x + this.yintercept();
  }
};

Line2.prototype.intersect = function(line, y1, x2, y2) {

  if ((defined(y1) && defined(y2)) || defined(line.end)) {
    return this.intersectSegment(line, y1, x2, y2);
  }

  var s1 = this.slope();
  var s2 = line.slope();

  // Parallel lines
  if (s1 === s2) {
    return (this.yintercept() === line.yintercept() &&
            this.xintercept() === line.xintercept());
  }

  if (finite(s1) && finite(s2)) {
    if (this.isHorizontal()) {
      return new Vec2(line.solveForX(this.yintercept()), this.yintercept())
    } if (line.isHorizontal()) {
      return new Vec2(this.solveForX(line.yintercept()), line.yintercept())
    }

    var x1 = line.solveForX(-1);
    y1 = line.solveForY(x1);
    x2 = line.solveForX(1);
    y2 = line.solveForY(x2);

    var x3 = this.solveForX(-1);
    var y3 = this.solveForY(x3);
    var x4 = this.solveForX(1);
    var y4 = this.solveForY(x4);

    var a = det(x1, y1, x2, y2);
    var b = det(x3, y3, x4, y4);

    var xnum = det(a, x1 - x2, b, x3 - x4);
    var ynum = det(a, y1 - y2, b, y3 - y4);

    var den = det(
      x1 - x2, y1 - y2,
      x3 - x4, y3 - y4
    );

    return Vec2(xnum/den, ynum/den);
  } else {
    var slope, yi, x = this.xintercept() || line.xintercept();
    if (!finite(s1)) {
      slope = s2;
      yi = line.yintercept();
    } else {
      slope = s1;
      yi = this.yintercept();
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

  if (line.isHorizontal()) {
    line.yintercept(y1);
  } else if (line.isVertical()) {
    line.xintercept(x2);
  } else {
    line.yintercept(y1 - slope * x1);
  }

  return line;
};

Line2.prototype.isHorizontal = function() {
  return !this.slope();
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
    return this.intersect(this.createPerpendicular(vec));
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
    return y === this.solveForY(x);
  }
};


if (typeof module !== "undefined" && typeof module.exports == "object") {
  module.exports = Line2;
}

if (typeof window !== "undefined") {
  window.Line2 = window.Line2 || Line2;
}
