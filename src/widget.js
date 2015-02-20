/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
Maze.createWidget = function(algorithm, width, height, options) {
  var ACTIONS, element, eventCallback, gridClass, html, id, mazeClass, ref, updateCallback, updateWalls, watch;
  if (options == null) {
    options = {};
  }
  updateWalls = function(maze, x, y, classes) {
    if (maze.isEast(x, y)) {
      classes.push("e");
    }
    if (maze.isWest(x, y)) {
      classes.push("w");
    }
    if (maze.isSouth(x, y)) {
      classes.push("s");
    }
    if (maze.isNorth(x, y)) {
      classes.push("n");
    }
    if (maze.isUnder(x, y)) {
      return classes.push("u");
    }
  };
  ACTIONS = {
    AldousBroder: function(maze, x, y, classes) {
      if (maze.algorithm.isCurrent(x, y)) {
        return classes.push("cursor");
      } else if (!maze.isBlank(x, y)) {
        classes.push("in");
        return updateWalls(maze, x, y, classes);
      }
    },
    GrowingTree: function(maze, x, y, classes) {
      if (!maze.isBlank(x, y)) {
        if (maze.algorithm.inQueue(x, y)) {
          classes.push("f");
        } else {
          classes.push("in");
        }
        return updateWalls(maze, x, y, classes);
      }
    },
    GrowingBinaryTree: function(maze, x, y, classes) {
      return ACTIONS.GrowingTree(maze, x, y, classes);
    },
    HuntAndKill: function(maze, x, y, classes) {
      if (maze.algorithm.isCurrent(x, y)) {
        classes.push("cursor");
      }
      if (!maze.isBlank(x, y)) {
        classes.push("in");
        return updateWalls(maze, x, y, classes);
      }
    },
    Prim: function(maze, x, y, classes) {
      if (maze.algorithm.isFrontier(x, y)) {
        return classes.push("f");
      } else if (maze.algorithm.isInside(x, y)) {
        classes.push("in");
        return updateWalls(maze, x, y, classes);
      }
    },
    RecursiveBacktracker: function(maze, x, y, classes) {
      if (maze.algorithm.isStack(x, y)) {
        classes.push("f");
      } else {
        classes.push("in");
      }
      return updateWalls(maze, x, y, classes);
    },
    RecursiveDivision: function(maze, x, y, classes) {
      return updateWalls(maze, x, y, classes);
    },
    Wilson: function(maze, x, y, classes) {
      if (maze.algorithm.isCurrent(x, y)) {
        classes.push("cursor");
        return updateWalls(maze, x, y, classes);
      } else if (!maze.isBlank(x, y)) {
        classes.push("in");
        return updateWalls(maze, x, y, classes);
      } else if (maze.algorithm.isVisited(x, y)) {
        return classes.push("f");
      }
    },
    Houston: function(maze, x, y, classes) {
      if (maze.algorithm.worker.isVisited != null) {
        return ACTIONS.Wilson(maze, x, y, classes);
      } else {
        return ACTIONS.AldousBroder(maze, x, y, classes);
      }
    },
    "default": function(maze, x, y, classes) {
      if (!maze.isBlank(x, y)) {
        classes.push("in");
        return updateWalls(maze, x, y, classes);
      }
    }
  };
  updateCallback = function(maze, x, y) {
    var cell, classes;
    classes = [];
    (ACTIONS[algorithm] || ACTIONS["default"])(maze, x, y, classes);
    cell = document.getElementById(maze.element.id + "_y" + y + "x" + x);
    return cell.className = classes.join(" ");
  };
  eventCallback = function(maze, x, y) {
    if (maze.element.quickStep) {
      return maze.element.mazePause();
    }
  };
  id = options.id || algorithm.toLowerCase();
  if (options.interval == null) {
    options.interval = 50;
  }
  mazeClass = "maze";
  if (options["class"]) {
    mazeClass += " " + options["class"];
  }
  gridClass = "grid";
  if (options.wallwise) {
    gridClass += " invert";
  }
  if (options.padded) {
    gridClass += " padded";
  }
  if ((ref = options.watch) != null ? ref : true) {
    watch = "<a id='" + id + "_watch' href='#' onclick='document.getElementById(\"" + id + "\").mazeQuickStep(); return false;'>Watch</a>";
  } else {
    watch = "";
  }
  html = "<div id=\"" + id + "\" class=\"" + mazeClass + "\">\n  <div id=\"" + id + "_grid\" class=\"" + gridClass + "\"></div>\n  <div class=\"operations\">\n    <a id=\"" + id + "_reset\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeReset(); return false;\">Reset</a>\n    <a id=\"" + id + "_step\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeStep(); return false;\">Step</a>\n    " + watch + "\n    <a id=\"" + id + "_run\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeRun(); return false;\">Run</a>\n  </div>\n</div>";
  document.write(html);
  element = document.getElementById(id);
  element.addClassName = function(el, name) {
    var className, classNames, i, len;
    classNames = el.className.split(" ");
    for (i = 0, len = classNames.length; i < len; i++) {
      className = classNames[i];
      if (className === name) {
        return;
      }
    }
    return el.className += " " + name;
  };
  element.removeClassName = function(el, name) {
    var className, classNames, i, len, results;
    if (el.className.length > 0) {
      classNames = el.className.split(" ");
      el.className = "";
      results = [];
      for (i = 0, len = classNames.length; i < len; i++) {
        className = classNames[i];
        if (className !== name) {
          if (el.className.length > 0) {
            el.className += " ";
          }
          results.push(el.className += className);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };
  element.mazePause = function() {
    if (this.mazeStepInterval != null) {
      clearInterval(this.mazeStepInterval);
      this.mazeStepInterval = null;
      this.quickStep = false;
      return true;
    }
  };
  element.mazeRun = function() {
    if (!this.mazePause()) {
      return this.mazeStepInterval = setInterval(((function(_this) {
        return function() {
          return _this.mazeStep();
        };
      })(this)), options.interval);
    }
  };
  element.mazeStep = function() {
    var ref1;
    if (!this.maze.step()) {
      this.mazePause();
      this.addClassName(document.getElementById(this.id + "_step"), "disabled");
      if ((ref1 = options.watch) != null ? ref1 : true) {
        this.addClassName(document.getElementById(this.id + "_watch"), "disabled");
      }
      return this.addClassName(document.getElementById(this.id + "_run"), "disabled");
    }
  };
  element.mazeQuickStep = function() {
    this.quickStep = true;
    return this.mazeRun();
  };
  element.mazeReset = function() {
    var grid, gridElement, i, j, ref1, ref2, ref3, row_id, value, x, y;
    this.mazePause();
    if (typeof options.input === "function") {
      value = options.input();
    } else {
      value = options.input;
    }
    this.maze = new Maze(width, height, Maze.Algorithms[algorithm], {
      seed: options.seed,
      rng: options.rng,
      input: value,
      weave: options.weave,
      weaveMode: options.weaveMode,
      weaveDensity: options.weaveDensity
    });
    this.maze.element = this;
    this.maze.onUpdate(updateCallback);
    this.maze.onEvent(eventCallback);
    grid = "";
    for (y = i = 0, ref1 = this.maze.height; 0 <= ref1 ? i < ref1 : i > ref1; y = 0 <= ref1 ? ++i : --i) {
      row_id = this.id + "_y" + y;
      grid += "<div class='row' id='" + row_id + "'>";
      for (x = j = 0, ref2 = this.maze.width; 0 <= ref2 ? j < ref2 : j > ref2; x = 0 <= ref2 ? ++j : --j) {
        grid += "<div id='" + row_id + "x" + x + "'>";
        if (options.padded) {
          grid += "<div class='np'></div>";
          grid += "<div class='wp'></div>";
          grid += "<div class='ep'></div>";
          grid += "<div class='sp'></div>";
          grid += "<div class='c'></div>";
        }
        grid += "</div>";
      }
      grid += "</div>";
    }
    gridElement = document.getElementById(this.id + "_grid");
    gridElement.innerHTML = grid;
    this.removeClassName(document.getElementById(this.id + "_step"), "disabled");
    if ((ref3 = options.watch) != null ? ref3 : true) {
      this.removeClassName(document.getElementById(this.id + "_watch"), "disabled");
    }
    return this.removeClassName(document.getElementById(this.id + "_run"), "disabled");
  };
  return element.mazeReset();
};

Maze.createCanvasWidget = function(algorithm, width, height, options) {
  var COLORS, drawCell, drawCellPadded, drawLine, drawMaze, element, eventCallback, gridClass, html, id, mazeClass, ref, ref1, styles, updateCallback, watch;
  if (options == null) {
    options = {};
  }
  styles = (ref = options.styles) != null ? ref : {};
  if (styles.blank == null) {
    styles.blank = "#ccc";
  }
  if (styles.f == null) {
    styles.f = "#faa";
  }
  if (styles.a == null) {
    styles.a = "#faa";
  }
  if (styles.b == null) {
    styles.b = "#afa";
  }
  if (styles["in"] == null) {
    styles["in"] = "#fff";
  }
  if (styles.cursor == null) {
    styles.cursor = "#7f7";
  }
  if (styles.wall == null) {
    styles.wall = "#000";
  }
  COLORS = {
    AldousBroder: function(maze, x, y) {
      if (maze.algorithm.isCurrent(x, y)) {
        return styles.cursor;
      } else if (!maze.isBlank(x, y)) {
        return styles["in"];
      }
    },
    GrowingTree: function(maze, x, y) {
      if (!maze.isBlank(x, y)) {
        if (maze.algorithm.inQueue(x, y)) {
          return styles.f;
        } else {
          return styles["in"];
        }
      }
    },
    GrowingBinaryTree: function(maze, x, y) {
      return COLORS.GrowingTree(maze, x, y);
    },
    HuntAndKill: function(maze, x, y) {
      if (maze.algorithm.isCurrent(x, y)) {
        return styles.cursor;
      } else if (!maze.isBlank(x, y)) {
        return styles["in"];
      }
    },
    Prim: function(maze, x, y) {
      if (maze.algorithm.isFrontier(x, y)) {
        return styles.f;
      } else if (maze.algorithm.isInside(x, y)) {
        return styles["in"];
      }
    },
    RecursiveBacktracker: function(maze, x, y) {
      if (maze.algorithm.isStack(x, y)) {
        return styles.f;
      } else if (!maze.isBlank(x, y)) {
        return styles["in"];
      }
    },
    RecursiveDivision: function(maze, x, y) {},
    Wilson: function(maze, x, y) {
      if (maze.algorithm.isCurrent(x, y)) {
        return styles.cursor;
      } else if (!maze.isBlank(x, y)) {
        return styles["in"];
      } else if (maze.algorithm.isVisited(x, y)) {
        return styles.f;
      }
    },
    Houston: function(maze, x, y) {
      if (maze.algorithm.worker != null) {
        if (maze.algorithm.worker.isVisited != null) {
          return COLORS.Wilson(maze, x, y);
        } else {
          return COLORS.AldousBroder(maze, x, y);
        }
      }
    },
    BlobbyDivision: function(maze, x, y) {
      switch (maze.algorithm.stateAt(x, y)) {
        case "blank":
          return styles.blank;
        case "in":
          return styles["in"];
        case "active":
          return styles.f;
        case "a":
          return styles.a;
        case "b":
          return styles.b;
      }
    },
    "default": function(maze, x, y) {
      if (!maze.isBlank(x, y)) {
        return styles["in"];
      }
    }
  };
  drawLine = function(ctx, x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    return ctx.lineTo(x2, y2);
  };
  drawCell = function(maze, x, y) {
    var color, colors, empx, nmpy, px, py, smpy, wmpx;
    px = x * maze.cellWidth;
    py = y * maze.cellHeight;
    wmpx = x === 0 ? px + 0.5 : px - 0.5;
    nmpy = y === 0 ? py + 0.5 : py - 0.5;
    empx = px - 0.5;
    smpy = py - 0.5;
    colors = COLORS[algorithm] || COLORS["default"];
    color = colors(maze, x, y);
    if (color == null) {
      color = (options.wallwise ? styles["in"] : styles.blank);
    }
    maze.context.fillStyle = color;
    maze.context.fillRect(px, py, maze.cellWidth, maze.cellHeight);
    maze.context.beginPath();
    if (maze.isWest(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, wmpx, py, wmpx, py + maze.cellHeight);
    }
    if (maze.isEast(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, empx + maze.cellWidth, py, empx + maze.cellWidth, py + maze.cellHeight);
    }
    if (maze.isNorth(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, px, nmpy, px + maze.cellWidth, nmpy);
    }
    if (maze.isSouth(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, px, smpy + maze.cellHeight, px + maze.cellWidth, smpy + maze.cellHeight);
    }
    maze.context.closePath();
    return maze.context.stroke();
  };
  drawCellPadded = function(maze, x, y) {
    var color, colors, px1, px2, px3, px4, py1, py2, py3, py4;
    px1 = x * maze.cellWidth;
    px2 = px1 + maze.insetWidth - 0.5;
    px4 = px1 + maze.cellWidth - 0.5;
    px3 = px4 - maze.insetWidth;
    py1 = y * maze.cellHeight;
    py2 = py1 + maze.insetHeight - 0.5;
    py4 = py1 + maze.cellHeight - 0.5;
    py3 = py4 - maze.insetHeight;
    px1 = x === 0 ? px1 + 0.5 : px1 - 0.5;
    py1 = y === 0 ? py1 + 0.5 : py1 - 0.5;
    colors = COLORS[algorithm] || COLORS["default"];
    color = colors(maze, x, y);
    if (color == null) {
      color = (options.wallwise ? styles["in"] : styles.blank);
    }
    maze.context.fillStyle = color;
    maze.context.fillRect(px2 - 0.5, py2 - 0.5, px3 - px2 + 1, py3 - py2 + 1);
    maze.context.beginPath();
    if (maze.isWest(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px1 - 0.5, py2 - 0.5, px2 - px1 + 1, py3 - py2 + 1);
      drawLine(maze.context, px1 - 1, py2, px2, py2);
      drawLine(maze.context, px1 - 1, py3, px2, py3);
    }
    if (!maze.isWest(x, y)) {
      drawLine(maze.context, px2, py2, px2, py3);
    }
    if (maze.isEast(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px3 - 0.5, py2 - 0.5, px4 - px3 + 1, py3 - py2 + 1);
      drawLine(maze.context, px3, py2, px4 + 1, py2);
      drawLine(maze.context, px3, py3, px4 + 1, py3);
    }
    if (!maze.isEast(x, y)) {
      drawLine(maze.context, px3, py2, px3, py3);
    }
    if (maze.isNorth(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px2 - 0.5, py1 - 0.5, px3 - px2 + 1, py2 - py1 + 1);
      drawLine(maze.context, px2, py1 - 1, px2, py2);
      drawLine(maze.context, px3, py1 - 1, px3, py2);
    }
    if (!maze.isNorth(x, y)) {
      drawLine(maze.context, px2, py2, px3, py2);
    }
    if (maze.isSouth(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px2 - 0.5, py3 - 0.5, px3 - px2 + 1, py4 - py3 + 1);
      drawLine(maze.context, px2, py3, px2, py4 + 1);
      drawLine(maze.context, px3, py3, px3, py4 + 1);
    }
    if (!maze.isSouth(x, y)) {
      drawLine(maze.context, px2, py3, px3, py3);
    }
    maze.context.closePath();
    return maze.context.stroke();
  };
  drawMaze = function(maze) {
    var col, i, ref1, results, row;
    results = [];
    for (row = i = 0, ref1 = maze.height; i < ref1; row = i += 1) {
      results.push((function() {
        var j, ref2, results1;
        results1 = [];
        for (col = j = 0, ref2 = maze.width; j < ref2; col = j += 1) {
          if (options.padded) {
            results1.push(drawCellPadded(maze, col, row));
          } else {
            results1.push(drawCell(maze, col, row));
          }
        }
        return results1;
      })());
    }
    return results;
  };
  updateCallback = function(maze, x, y) {
    if (options.padded) {
      return drawCellPadded(maze, x, y);
    } else {
      return drawCell(maze, x, y);
    }
  };
  eventCallback = function(maze, x, y) {
    if (maze.element.quickStep) {
      return maze.element.mazePause();
    }
  };
  id = options.id || algorithm.toLowerCase();
  if (options.interval == null) {
    options.interval = 50;
  }
  mazeClass = "maze";
  if (options["class"]) {
    mazeClass += " " + options["class"];
  }
  gridClass = "grid";
  if (options.wallwise) {
    gridClass += " invert";
  }
  if (options.padded) {
    gridClass += " padded";
  }
  if ((ref1 = options.watch) != null ? ref1 : true) {
    watch = "<a id='" + id + "_watch' href='#' onclick='document.getElementById(\"" + id + "\").mazeQuickStep(); return false;'>Watch</a>";
  } else {
    watch = "";
  }
  html = "<div id=\"" + id + "\" class=\"" + mazeClass + "\">\n  <canvas id=\"" + id + "_canvas\" width=\"210\" height=\"210\" class=\"" + gridClass + "\"></canvas>\n  <div class=\"operations\">\n    <a id=\"" + id + "_reset\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeReset(); return false;\">Reset</a>\n    <a id=\"" + id + "_step\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeStep(); return false;\">Step</a>\n    " + watch + "\n    <a id=\"" + id + "_run\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeRun(); return false;\">Run</a>\n  </div>\n</div>";
  document.write(html);
  element = document.getElementById(id);
  element.addClassName = function(el, name) {
    var className, classNames, i, len;
    classNames = el.className.split(" ");
    for (i = 0, len = classNames.length; i < len; i++) {
      className = classNames[i];
      if (className === name) {
        return;
      }
    }
    return el.className += " " + name;
  };
  element.removeClassName = function(el, name) {
    var className, classNames, i, len, results;
    if (el.className.length > 0) {
      classNames = el.className.split(" ");
      el.className = "";
      results = [];
      for (i = 0, len = classNames.length; i < len; i++) {
        className = classNames[i];
        if (className !== name) {
          if (el.className.length > 0) {
            el.className += " ";
          }
          results.push(el.className += className);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };
  element.mazePause = function() {
    if (this.mazeStepInterval != null) {
      clearInterval(this.mazeStepInterval);
      this.mazeStepInterval = null;
      this.quickStep = false;
      return true;
    }
  };
  element.mazeRun = function() {
    if (!this.mazePause()) {
      return this.mazeStepInterval = setInterval(((function(_this) {
        return function() {
          return _this.mazeStep();
        };
      })(this)), options.interval);
    }
  };
  element.mazeStep = function() {
    var ref2;
    if (!this.maze.step()) {
      this.mazePause();
      this.addClassName(document.getElementById(this.id + "_step"), "disabled");
      if ((ref2 = options.watch) != null ? ref2 : true) {
        this.addClassName(document.getElementById(this.id + "_watch"), "disabled");
      }
      return this.addClassName(document.getElementById(this.id + "_run"), "disabled");
    }
  };
  element.mazeQuickStep = function() {
    this.quickStep = true;
    return this.mazeRun();
  };
  element.mazeReset = function() {
    var canvas, growSpeed, inset, ref2, ref3, threshold, value, wallSpeed;
    this.mazePause();
    if (typeof options.input === "function") {
      value = options.input();
    } else {
      value = options.input;
    }
    if (typeof options.threshold === "function") {
      threshold = options.threshold();
    } else {
      threshold = options.threshold;
    }
    growSpeed = Math.round(Math.sqrt(width * height));
    wallSpeed = Math.round((width < height ? width : height) / 2);
    this.maze = new Maze(width, height, Maze.Algorithms[algorithm], {
      seed: options.seed,
      rng: options.rng,
      input: value,
      weave: options.weave,
      weaveMode: options.weaveMode,
      weaveDensity: options.weaveDensity,
      threshold: threshold,
      growSpeed: growSpeed,
      wallSpeed: wallSpeed
    });
    canvas = document.getElementById(this.id + "_canvas");
    this.maze.element = this;
    this.maze.canvas = canvas;
    this.maze.context = canvas.getContext('2d');
    this.maze.cellWidth = Math.floor(canvas.width / this.maze.width);
    this.maze.cellHeight = Math.floor(canvas.height / this.maze.height);
    if (options.padded) {
      inset = (ref2 = options.inset) != null ? ref2 : 0.1;
      this.maze.insetWidth = Math.ceil(inset * this.maze.cellWidth);
      this.maze.insetHeight = Math.ceil(inset * this.maze.cellHeight);
    }
    this.maze.onUpdate(updateCallback);
    this.maze.onEvent(eventCallback);
    this.maze.context.clearRect(0, 0, canvas.width, canvas.height);
    this.removeClassName(document.getElementById(this.id + "_step"), "disabled");
    if ((ref3 = options.watch) != null ? ref3 : true) {
      this.removeClassName(document.getElementById(this.id + "_watch"), "disabled");
    }
    this.removeClassName(document.getElementById(this.id + "_run"), "disabled");
    return drawMaze(this.maze);
  };
  return element.mazeReset();
};
