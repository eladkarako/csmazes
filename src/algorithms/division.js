/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.RecursiveDivision = (function(superClass) {
  extend(RecursiveDivision, superClass);

  RecursiveDivision.prototype.CHOOSE_REGION = 0;

  RecursiveDivision.prototype.MAKE_WALL = 1;

  RecursiveDivision.prototype.MAKE_PASSAGE = 2;

  RecursiveDivision.prototype.HORIZONTAL = 1;

  RecursiveDivision.prototype.VERTICAL = 2;

  RecursiveDivision.prototype.isCurrent = function(x, y) {
    return (this.region != null) && (this.region.x <= x && x < this.region.x + this.region.width) && (this.region.y <= y && y < this.region.y + this.region.height);
  };

  function RecursiveDivision(maze, options) {
    RecursiveDivision.__super__.constructor.apply(this, arguments);
    this.stack = [
      {
        x: 0,
        y: 0,
        width: this.maze.width,
        height: this.maze.height
      }
    ];
    this.state = this.CHOOSE_REGION;
  }

  RecursiveDivision.prototype.chooseOrientation = function(width, height) {
    if (width < height) {
      return this.HORIZONTAL;
    } else if (height < width) {
      return this.VERTICAL;
    } else if (this.rand.nextBoolean()) {
      return this.HORIZONTAL;
    } else {
      return this.VERTICAL;
    }
  };

  RecursiveDivision.prototype.updateRegion = function(region) {
    var i, ref, results, x, y;
    results = [];
    for (y = i = 0, ref = region.height; 0 <= ref ? i < ref : i > ref; y = 0 <= ref ? ++i : --i) {
      results.push((function() {
        var j, ref1, results1;
        results1 = [];
        for (x = j = 0, ref1 = region.width; 0 <= ref1 ? j < ref1 : j > ref1; x = 0 <= ref1 ? ++j : --j) {
          results1.push(this.updateAt(region.x + x, region.y + y));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  RecursiveDivision.prototype.step = function() {
    switch (this.state) {
      case this.CHOOSE_REGION:
        return this.chooseRegion();
      case this.MAKE_WALL:
        return this.makeWall();
      case this.MAKE_PASSAGE:
        return this.makePassage();
    }
  };

  RecursiveDivision.prototype.chooseRegion = function() {
    var priorRegion, ref;
    ref = [this.region, this.stack.pop()], priorRegion = ref[0], this.region = ref[1];
    if (priorRegion) {
      this.updateRegion(priorRegion);
    }
    if (this.region) {
      this.updateRegion(this.region);
      this.state = this.MAKE_WALL;
      return true;
    } else {
      return false;
    }
  };

  RecursiveDivision.prototype.makeWall = function() {
    var dx, dy, length, nx, ny, ref, x, y;
    this.horizontal = this.chooseOrientation(this.region.width, this.region.height) === this.HORIZONTAL;
    this.wx = this.region.x + (this.horizontal ? 0 : this.rand.nextInteger(this.region.width - 2));
    this.wy = this.region.y + (this.horizontal ? this.rand.nextInteger(this.region.height - 2) : 0);
    dx = this.horizontal ? 1 : 0;
    dy = this.horizontal ? 0 : 1;
    length = this.horizontal ? this.region.width : this.region.height;
    this.dir = this.horizontal ? Maze.Direction.S : Maze.Direction.E;
    this.odir = Maze.Direction.opposite[this.dir];
    ref = [this.wx, this.wy], x = ref[0], y = ref[1];
    while (length > 0) {
      this.maze.carve(x, y, this.dir);
      this.updateAt(x, y);
      nx = x + Maze.Direction.dx[this.dir];
      ny = y + Maze.Direction.dy[this.dir];
      this.maze.carve(nx, ny, this.odir);
      this.updateAt(nx, ny);
      x += dx;
      y += dy;
      length -= 1;
    }
    this.state = this.MAKE_PASSAGE;
    return true;
  };

  RecursiveDivision.prototype.makePassage = function() {
    var height, nx, ny, px, py, width, x, y;
    px = this.wx + (this.horizontal ? this.rand.nextInteger(this.region.width) : 0);
    py = this.wy + (this.horizontal ? 0 : this.rand.nextInteger(this.region.height));
    this.maze.uncarve(px, py, this.dir);
    this.updateAt(px, py);
    nx = px + Maze.Direction.dx[this.dir];
    ny = py + Maze.Direction.dy[this.dir];
    this.maze.uncarve(nx, ny, this.odir);
    this.updateAt(nx, ny);
    width = this.horizontal ? this.region.width : this.wx - this.region.x + 1;
    height = this.horizontal ? this.wy - this.region.y + 1 : this.region.height;
    if (width >= 2 && height >= 2) {
      this.stack.push({
        x: this.region.x,
        y: this.region.y,
        width: width,
        height: height
      });
    }
    x = this.horizontal ? this.region.x : this.wx + 1;
    y = this.horizontal ? this.wy + 1 : this.region.y;
    width = this.horizontal ? this.region.width : this.region.x + this.region.width - this.wx - 1;
    height = this.horizontal ? this.region.y + this.region.height - this.wy - 1 : this.region.height;
    if (width >= 2 && height >= 2) {
      this.stack.push({
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
    this.state = this.CHOOSE_REGION;
    return true;
  };

  return RecursiveDivision;

})(Maze.Algorithm);