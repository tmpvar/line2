if (typeof require !== "undefined") {
  var Line2 = require("../line2.js");
  var Vec2 = require("vec2");
}

var ok = function(a, msg) { if (!a) throw new Error(msg || "not ok"); };

describe('line2', function() {
  describe('#ctor', function() {
    it('accepts slope/yintercept', function() {
      var l = new Line2(1, 0);
      ok(l.slope() === 1);
      ok(l.yintercept() === 0);
    });

    it('accepts 4 points', function() {
      var l = new Line2(0, 0, 10, 10);
      ok(l.slope() === 1);
      ok(l.yintercept() === 0);
    });
  })


  describe('#fromPoints', function() {
    it('computes the slope and yintercept', function() {
      [
        Line2.fromPoints([1, 1], [10, 10]),
        Line2.fromPoints(Vec2(1, 1), Vec2(10, 10)),
        Line2.fromPoints(1, 1, 10, 10)
      ].forEach(function(line) {
        ok(line.slope() === 1);
        ok(line.yintercept() === 0);
      });
    });
  });

  describe('#intersect', function() {
    it('computes the intersection of normal lines', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 10);
      var l2 = Line2.fromPoints(0, 10, 10, 0);

      var v = l1.intersect(l2);
      ok(v.equal(5, 5));
    });

    it('returns false when lines are parallel', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 10);
      var l2 = Line2.fromPoints(5, 5, 50, 50);

      ok(!l1.intersect(l2));
    });

    it('finds the intersection of perpendicular lines (vertical-vertical)', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 0);
      var l2 = Line2.fromPoints(5, 10, 5, 0);
      ok(l1.intersect(l2).equal(5, 0));
      ok(l2.intersect(l1).equal(5, 0));
    });

    it('finds the intersection of lines (vertial-diagonal)', function() {
      var l1 = Line2.fromPoints(0, 0, 55, 25);
      var l2 = Line2.fromPoints(30, 30, 30, 0);
      ok(l1.intersect(l2).equal(30, 13.6363635));
      ok(l2.intersect(l1).equal(30, 13.6363635));

    });
  });

  describe('#isHorizontal', function() {
    it('true if horizontal', function() {
      var l = Line2.fromPoints(0, 0, 100, 0);
      ok(l.isHorizontal());
    });
    it('false if not horizontal', function() {
      var l = Line2.fromPoints(0, 0, 100, 10);
      ok(!l.isHorizontal());
    });
  });

  describe('#isVertical', function() {
    it('true if vertical', function() {
      var l = Line2.fromPoints(100, 0, 100, 100);
      ok(l.isVertical());
    });
    it('false if not vertical', function() {
      var l = Line2.fromPoints(10, 0, 100, 10);
      ok(!l.isVertical());
    });
  });

  describe('#closestPointTo', function() {
    it('finds the closest point to this line (horizontal)', function() {
      var l = Line2.fromPoints(0, 0, 100, 0);
      ok(l.closestPointTo(Vec2(10, 10)).equal(Vec2(10, 0)));
    });

    it('finds the closest point to this line (vertical)', function() {
      var l = Line2.fromPoints(100, 0, 100, 100);
      ok(l.closestPointTo(Vec2(10, 10)).equal(Vec2(100, 10)));
    });

    it('finds the closest point to this line (diagonal)', function() {
      var l = Line2.fromPoints(0, 0, 100, 100);
      ok(l.closestPointTo(Vec2(25, 75)).equal(Vec2(50, 50)));
    });
  });
});
