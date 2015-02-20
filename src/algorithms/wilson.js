/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.Wilson = (function(superClass) {
  extend(Wilson, superClass);

  Wilson.prototype.IN = 0x1000;

  function Wilson(maze, options) {
    Wilson.__super__.constructor.apply(this, arguments);
    this.state = 0;
    this.remaining = this.maze.width * this.maze.height;
    this.visits = {};
  }

  Wilson.prototype.isCurrent = function(x, y) {
    return this.x === x && this.y === y;
  };

  Wilson.prototype.isVisited = function(x, y) {
    return this.visits[x + ":" + y] != null;
  };

  Wilson.prototype.addVisit = function(x, y, dir) {
    return this.visits[x + ":" + y] = dir != null ? dir : 0;
  };

  Wilson.prototype.exitTaken = function(x, y) {
    return this.visits[x + ":" + y];
  };

  Wilson.prototype.startStep = function() {
    var x, y;
    x = this.rand.nextInteger(this.maze.width);
    y = this.rand.nextInteger(this.maze.height);
    this.maze.carve(x, y, this.IN);
    this.updateAt(x, y);
    this.remaining--;
    return this.state = 1;
  };

  Wilson.prototype.startWalkStep = function() {
    var results;
    this.visits = {};
    results = [];
    while (true) {
      this.x = this.rand.nextInteger(this.maze.width);
      this.y = this.rand.nextInteger(this.maze.height);
      if (this.maze.isBlank(this.x, this.y)) {
        this.eventAt(this.x, this.y);
        this.state = 2;
        this.start = {
          x: this.x,
          y: this.y
        };
        this.addVisit(this.x, this.y);
        this.updateAt(this.x, this.y);
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Wilson.prototype.walkStep = function() {
    var direction, i, len, nx, ny, ref, ref1, results, x, y;
    ref = this.rand.randomDirections();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      direction = ref[i];
      nx = this.x + Maze.Direction.dx[direction];
      ny = this.y + Maze.Direction.dy[direction];
      if (this.maze.isValid(nx, ny)) {
        ref1 = [this.x, this.y, nx, ny], x = ref1[0], y = ref1[1], this.x = ref1[2], this.y = ref1[3];
        this.addVisit(x, y, direction);
        this.updateAt(x, y);
        this.updateAt(nx, ny);
        if (!this.maze.isBlank(nx, ny)) {
          this.x = this.start.x;
          this.y = this.start.y;
          this.state = 3;
          this.eventAt(this.x, this.y);
        }
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Wilson.prototype.resetVisits = function() {
    var dir, key, ref, ref1, results, x, y;
    ref = this.visits;
    results = [];
    for (key in ref) {
      dir = ref[key];
      ref1 = key.split(":"), x = ref1[0], y = ref1[1];
      delete this.visits[key];
      results.push(this.updateAt(x, y));
    }
    return results;
  };

  Wilson.prototype.runStep = function() {
    var dir, nx, ny, ref, x, y;
    if (this.remaining > 0) {
      dir = this.exitTaken(this.x, this.y);
      nx = this.x + Maze.Direction.dx[dir];
      ny = this.y + Maze.Direction.dy[dir];
      if (!this.maze.isBlank(nx, ny)) {
        this.resetVisits();
        this.state = 1;
      }
      this.maze.carve(this.x, this.y, dir);
      this.maze.carve(nx, ny, Maze.Direction.opposite[dir]);
      ref = [this.x, this.y, nx, ny], x = ref[0], y = ref[1], this.x = ref[2], this.y = ref[3];
      if (this.state === 1) {
        delete this.x;
        delete this.y;
      }
      this.updateAt(x, y);
      this.updateAt(nx, ny);
      this.remaining--;
    }
    return this.remaining > 0;
  };

  Wilson.prototype.step = function() {
    if (this.remaining > 0) {
      switch (this.state) {
        case 0:
          this.startStep();
          break;
        case 1:
          this.startWalkStep();
          break;
        case 2:
          this.walkStep();
          break;
        case 3:
          this.runStep();
      }
    }
    return this.remaining > 0;
  };

  return Wilson;

})(Maze.Algorithm);