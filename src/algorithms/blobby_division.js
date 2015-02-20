/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var BlobbyCell, BlobbyRegion,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BlobbyCell = (function() {
  function BlobbyCell(row1, col1) {
    this.row = row1;
    this.col = col1;
    this.name = "r" + this.row + "c" + this.col;
  }

  BlobbyCell.prototype.north = function() {
    return "r" + (this.row - 1) + "c" + this.col;
  };

  BlobbyCell.prototype.south = function() {
    return "r" + (this.row + 1) + "c" + this.col;
  };

  BlobbyCell.prototype.east = function() {
    return "r" + this.row + "c" + (this.col + 1);
  };

  BlobbyCell.prototype.west = function() {
    return "r" + this.row + "c" + (this.col - 1);
  };

  return BlobbyCell;

})();

BlobbyRegion = (function() {
  function BlobbyRegion() {
    this.cells = [];
  }

  BlobbyRegion.prototype.addCell = function(cell) {
    this[cell.name] = cell;
    return this.cells.push(cell);
  };

  return BlobbyRegion;

})();

Maze.Algorithms.BlobbyDivision = (function(superClass) {
  extend(BlobbyDivision, superClass);

  BlobbyDivision.prototype.START = 1;

  BlobbyDivision.prototype.PLANT = 2;

  BlobbyDivision.prototype.GROW = 3;

  BlobbyDivision.prototype.WALL = 4;

  function BlobbyDivision(maze, options) {
    var cell, col, i, j, ref, ref1, ref2, ref3, ref4, region, row;
    BlobbyDivision.__super__.constructor.apply(this, arguments);
    this.threshold = (ref = options.threshold) != null ? ref : 4;
    this.growSpeed = (ref1 = options.growSpeed) != null ? ref1 : 5;
    this.wallSpeed = (ref2 = options.wallSpeed) != null ? ref2 : 2;
    this.stack = [];
    region = new BlobbyRegion;
    for (row = i = 0, ref3 = maze.height; 0 <= ref3 ? i < ref3 : i > ref3; row = 0 <= ref3 ? ++i : --i) {
      for (col = j = 0, ref4 = maze.width; 0 <= ref4 ? j < ref4 : j > ref4; col = 0 <= ref4 ? ++j : --j) {
        cell = new BlobbyCell(row, col);
        region.addCell(cell);
        if (row > 0) {
          maze.carve(col, row, Maze.Direction.N);
          maze.carve(col, row - 1, Maze.Direction.S);
        }
        if (col > 0) {
          maze.carve(col, row, Maze.Direction.W);
          maze.carve(col - 1, row, Maze.Direction.E);
        }
      }
    }
    this.stack.push(region);
    this.state = this.START;
  }

  BlobbyDivision.prototype.stateAt = function(col, row) {
    var cell, name, ref, ref1;
    name = "r" + row + "c" + col;
    cell = (ref = this.region) != null ? ref[name] : void 0;
    if (cell) {
      return (ref1 = cell.state) != null ? ref1 : "active";
    } else {
      return "blank";
    }
  };

  BlobbyDivision.prototype.step = function() {
    switch (this.state) {
      case this.START:
        return this.startRegion();
      case this.PLANT:
        return this.plantSeeds();
      case this.GROW:
        return this.growSeeds();
      case this.WALL:
        return this.drawWall();
    }
  };

  BlobbyDivision.prototype.startRegion = function() {
    var cell, i, len, ref;
    delete this.boundary;
    this.region = this.stack.pop();
    if (this.region) {
      ref = this.region.cells;
      for (i = 0, len = ref.length; i < len; i++) {
        cell = ref[i];
        delete cell.state;
      }
      this.highlightRegion(this.region);
      this.state = this.PLANT;
      return true;
    } else {
      return false;
    }
  };

  BlobbyDivision.prototype.plantSeeds = function() {
    var a, b, i, indexes, ref, results;
    indexes = this.rand.randomizeList((function() {
      results = [];
      for (var i = 0, ref = this.region.cells.length; 0 <= ref ? i < ref : i > ref; 0 <= ref ? i++ : i--){ results.push(i); }
      return results;
    }).apply(this));
    this.subregions = {
      a: new BlobbyRegion,
      b: new BlobbyRegion
    };
    a = this.region.cells[indexes[0]];
    b = this.region.cells[indexes[1]];
    a.state = "a";
    b.state = "b";
    this.subregions.a.addCell(a);
    this.subregions.b.addCell(b);
    this.updateAt(a.col, a.row);
    this.updateAt(b.col, b.row);
    this.frontier = [a, b];
    this.state = this.GROW;
    return true;
  };

  BlobbyDivision.prototype.growSeeds = function() {
    var cell, e, growCount, index, list, n, neighbor, s, w;
    growCount = 0;
    while (this.frontier.length > 0 && growCount < this.growSpeed) {
      index = this.rand.nextInteger(this.frontier.length);
      cell = this.frontier[index];
      n = this.region[cell.north()];
      s = this.region[cell.south()];
      e = this.region[cell.east()];
      w = this.region[cell.west()];
      list = [];
      if (n && !n.state) {
        list.push(n);
      }
      if (s && !s.state) {
        list.push(s);
      }
      if (e && !e.state) {
        list.push(e);
      }
      if (w && !w.state) {
        list.push(w);
      }
      if (list.length > 0) {
        neighbor = this.rand.randomElement(list);
        neighbor.state = cell.state;
        this.subregions[cell.state].addCell(neighbor);
        this.frontier.push(neighbor);
        this.updateAt(neighbor.col, neighbor.row);
        growCount += 1;
      } else {
        this.frontier.splice(index, 1);
      }
    }
    this.state = this.frontier.length === 0 ? this.WALL : this.GROW;
    return true;
  };

  BlobbyDivision.prototype.findWall = function() {
    var cell, e, i, len, n, ref, s, w;
    this.boundary = [];
    ref = this.subregions.a.cells;
    for (i = 0, len = ref.length; i < len; i++) {
      cell = ref[i];
      n = this.region[cell.north()];
      s = this.region[cell.south()];
      e = this.region[cell.east()];
      w = this.region[cell.west()];
      if (n && n.state !== cell.state) {
        this.boundary.push({
          from: cell,
          to: n,
          dir: Maze.Direction.N
        });
      }
      if (s && s.state !== cell.state) {
        this.boundary.push({
          from: cell,
          to: s,
          dir: Maze.Direction.S
        });
      }
      if (e && e.state !== cell.state) {
        this.boundary.push({
          from: cell,
          to: e,
          dir: Maze.Direction.E
        });
      }
      if (w && w.state !== cell.state) {
        this.boundary.push({
          from: cell,
          to: w,
          dir: Maze.Direction.W
        });
      }
    }
    return this.rand.removeRandomElement(this.boundary);
  };

  BlobbyDivision.prototype.drawWall = function() {
    var cell, i, j, k, len, len1, len2, ref, ref1, ref2, wall, wallCount;
    if (!this.boundary) {
      this.findWall();
    }
    wallCount = 0;
    while (this.boundary.length > 0 && wallCount < this.wallSpeed) {
      wall = this.rand.removeRandomElement(this.boundary);
      this.maze.uncarve(wall.from.col, wall.from.row, wall.dir);
      this.maze.uncarve(wall.to.col, wall.to.row, Maze.Direction.opposite[wall.dir]);
      this.updateAt(wall.from.col, wall.from.row);
      wallCount += 1;
    }
    if (this.boundary.length === 0) {
      ref = this.region.cells;
      for (i = 0, len = ref.length; i < len; i++) {
        cell = ref[i];
        cell.state = "blank";
      }
      if (this.subregions.a.cells.length >= this.threshold) {
        this.stack.push(this.subregions.a);
      } else {
        ref1 = this.subregions.a.cells;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          cell = ref1[j];
          cell.state = "in";
        }
      }
      if (this.subregions.b.cells.length >= this.threshold) {
        this.stack.push(this.subregions.b);
      } else {
        ref2 = this.subregions.b.cells;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          cell = ref2[k];
          cell.state = "in";
        }
      }
      this.highlightRegion(this.subregions.a);
      this.highlightRegion(this.subregions.b);
      this.state = this.START;
    }
    return true;
  };

  BlobbyDivision.prototype.highlightRegion = function(region) {
    var cell, i, len, ref, results;
    ref = region.cells;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      cell = ref[i];
      results.push(this.updateAt(cell.col, cell.row));
    }
    return results;
  };

  return BlobbyDivision;

})(Maze.Algorithm);