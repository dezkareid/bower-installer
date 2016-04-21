var fs      = require('fs'),
    pathLib = require('path'),
    _       = require('lodash');

exports.deleteFolderRecursive = function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

var KEYS_MATCH = /\{[ ]?\w+[ ]?\}/g;
var KEY_NAME = /\{[ ]?(\w+)[ ]?\}/;

exports.hasVariableInPath =function(path) {
  return path.indexOf('{') !== -1;
}

exports.parsePath = function(path, map) {
    if (path.indexOf('{') !== -1) {
      
        var keys = path.match(KEYS_MATCH);

        _.each(keys, function(key) {
          var p = key.match(KEY_NAME);
          key = p[1];
          
          var val = key in map ? map[key] : '';
          path = path.replace(new RegExp('\\{[ ]?' + key + '[ ]?\\}', 'gi'), val);

        });
    }
    return path;
};

exports.getJSON = function(path, pathSep, filename) {
  var pakcfg = null;

    // If it is a directory lets try to read from package.json file
  if (fs.lstatSync(path).isDirectory()) {
    var pakpath = path + pathSep + (filename ? filename : 'bower') + '.json';

    // we want the build to continue as default if case something fails
    try {
        // read package.json file
        var file = fs.readFileSync(pakpath).toString('ascii')

        // parse file
        pakcfg = JSON.parse(file);

    } catch (error) {
    }
  }

  return pakcfg;
}

// Loops over the paths map looking for a RegExp formatted key, returning the
// path for the first match against the provided filename. Returns null if no
// match is made.
exports.getPathByRegExp = function getPathByRegExp(filename, paths) {
  for(var key in paths) {
    if(!paths.hasOwnProperty(key)) {
      continue;
    }

    if(key.indexOf("/") === 0
    && key.lastIndexOf("/") > 0) {
      // Assume the key is a RegExp formatted string.
      var regExp = new RegExp(key.substring(1, key.lastIndexOf("/")) );
      if(filename.match(regExp)) {
        return paths[key];
      }
    }
  }

  return null;
}

exports.getExtension = function getExtension(filename) {
    return pathLib.extname(filename||'').slice(1);
}


exports.copyFile = function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

exports.minifiedPath=function(path) {
  var directory, file_name, extension;
  var path_data = pathLib.parse(path);
  directory = path_data.dir + "/";
  file_name = path_data.name;
  extension = path_data.ext;
  if (extension == ".css" || extension == ".js") {
    try{
      var path_minified = directory + file_name + ".min" + extension;
      if (fs.existsSync(path_minified)) {
        return path_minified;
      }
    }
    catch (error){
      return path;
    }
  }
  return path;
}