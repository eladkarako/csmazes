/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.Prim = (function(superClass) {
  extend(Prim, superClass);

  Prim.prototype.IN = 0x1000;

  Prim.prototype.FRONTIER = 0x2000;

  Prim.prototype.START = 1;

  Prim.prototype.EXPAND = 2;

  Prim.prototype.DONE = 3;

  function Prim(maze, options) {
    Prim.__super__.constructor.apply(this, arguments);
    this.frontierCells = [];
    this.state = this.START;
  }

  Prim.prototype.isOutside = function(x, y) {
    return this.maze.isValid(x, y) && this.maze.isBlank(x, y);
  };

  Prim.prototype.isInside = function(x, y) {
    return this.maze.isValid(x, y) && this.maze.isSet(x, y, this.IN);
  };

  Prim.prototype.isFrontier = function(x, y) {
    return this.maze.isValid(x, y) && this.maze.isSet(x, y, this.FRONTIER);
  };

  Prim.prototype.addFrontier = function(x, y) {
    if (this.isOutside(x, y)) {
      this.frontierCells.push({
        x: x,
        y: y
      });
      this.maze.carve(x, y, this.FRONTIER);
      return this.updateAt(x, y);
    }
  };

  Prim.prototype.markCell = function(x, y) {
    this.maze.carve(x, y, this.IN);
    this.maze.uncarve(x, y, this.FRONTIER);
    this.updateAt(x, y);
    this.addFrontier(x - 1, y);
    this.addFrontier(x + 1, y);
    this.addFrontier(x, y - 1);
    return this.addFrontier(x, y + 1);
  };

  Prim.prototype.findNeighborsOf = function(x, y) {
    var neighbors;
    neighbors = [];
    if (this.isInside(x - 1, y)) {
      neighbors.push(Maze.Direction.W);
    }
    if (this.isInside(x + 1, y)) {
      neighbors.push(Maze.Direction.E);
    }
    if (this.isInside(x, y - 1)) {
      neighbors.push(Maze.Direction.N);
    }
    if (this.isInside(x, y + 1)) {
      neighbors.push(Maze.Direction.S);
    }
    return neighbors;
  };

  Prim.prototype.startStep = function() {
    this.markCell(this.rand.nextInteger(this.maze.width), this.rand.nextInteger(this.maze.height));
    return this.state = this.EXPAND;
  };

  Prim.prototype.expandStep = function() {
    var cell, direction, nx, nx2, ny, ny2, ref;
    cell = this.rand.removeRandomElement(this.frontierCells);
    direction = this.rand.randomElement(this.findNeighborsOf(cell.x, cell.y));
    nx = cell.x + Maze.Direction.dx[direction];
    ny = cell.y + Maze.Direction.dy[direction];
    if (this.maze.isWeave && this.maze.isPerpendicular(nx, ny, direction)) {
      nx2 = nx + Maze.Direction.dx[direction];
      ny2 = ny + Maze.Direction.dy[direction];
      if (this.isInside(nx2, ny2)) {
        this.performThruWeave(nx, ny);
        this.updateAt(nx, ny);
        ref = [nx2, ny2], nx = ref[0], ny = ref[1];
      }
    }
    this.maze.carve(nx, ny, Maze.Direction.opposite[direction]);
    this.updateAt(nx, ny);
    this.maze.carve(cell.x, cell.y, direction);
    this.markCell(cell.x, cell.y);
    if (this.frontierCells.length === 0) {
      return this.state = this.DONE;
    }
  };

  Prim.prototype.step = function() {
    switch (this.state) {
      case this.START:
        this.startStep();
        break;
      case this.EXPAND:
        this.expandStep();
    }
    return this.state !== this.DONE;
  };

  return Prim;

})(Maze.Algorithm);