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
  });


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
      var l2 = Line2.fromPoints(0, 5, 5, 10);

      ok(!l1.intersect(l2));
    });

    it('returns true when lines are collinear', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 10);
      var l2 = Line2.fromPoints(5, 5, 9, 9);
      ok(l1.intersect(l2) === true);
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

    it('returns a vec2 when intersected with a segment (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(5, 5, 5, -5).equal(5, 0));
    });

    it('returns false when no intersection (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(!l1.intersect(5, 5, 5, 1));
    });

    it('returns true when colinear (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(0, 0, 5, 0) === true);
    });

    it('returns false when parallel (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(0, 5, 5, 5) === false);
    });

    it('returns true when colinear (vertical)', function() {
      var l1 = Line2(100, 0, 100, 100);
      ok(l1.intersect(100, 10, 100, 50) === true);
    });

    it('returns vec2 when intersection (vertical)', function() {
      var l1 = Line2(100, 0, 100, 100);
      ok(l1.intersect(50, 50, 200, 50).equal(100, 50));
    });

    it('returns false when parallel (vertical)', function() {
      var l1 = Line2(100, 0, 100, 100);
      ok(l1.intersect(5, 0, 5, 5) === false);
    });

    it('returns a vec2 when intersected with a segment (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 100);
      ok(l1.intersect(25, 75, 75, 25).equal(50, 50));
    });

    it('returns false when no intersection (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 100);
      ok(!l1.intersect(25, 75, 30, 75));
    });

    it('returns true when colinear (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(0, 0, 5, 0) === true);
    });

    it('returns false when parallel (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 100);
      ok(l1.intersect(0, 5, 5, 10) === false);
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

  describe('#containsPoint', function() {
    it('may take an x,y', function() {
      var l = Line2(0, 0, 10, 0);
      ok(!l.containsPoint(5, 1));
      ok(l.containsPoint(5, 0));
    });

    it('returns false when not contained (horizontal)', function() {
      var l = Line2(0, 0, 10, 0);
      ok(!l.containsPoint(Vec2(5, 1)));
    });

    it('returns true when contained (horizontal)', function() {
      var l = Line2(0, 0, 10, 0);
      ok(l.containsPoint(Vec2(5, 0)));
    });

    it('returns false when not contained (vertical)', function() {
      var l = Line2(10, 0, 10, 10);
      ok(!l.containsPoint(Vec2(5, 1)));
    });

    it('returns true when contained (vertical)', function() {
      var l = Line2(10, 0, 10, 10);
      ok(l.containsPoint(Vec2(10, 5)));
    });

    it('returns true when contained (diagonal)', function() {
      var l = Line2(0, 0, 10, 10);
      ok(l.containsPoint(Vec2(5, 5)));
    });

    it('returns false when not contained (diagonal)', function() {
      var l = Line2(0, 0, 10, 10);
      ok(!l.containsPoint(Vec2(5, 2)));
    });
  });
});
