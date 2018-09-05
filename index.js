var debug = require('debug')('nightmare:upload');

module.exports = exports = function(Nightmare) {
  Nightmare.action('upload',
    function(ns, options, parent, win, renderer, done) {
      parent.respondTo('upload', function(selector, pathsToUpload, done) {
        parent.emit('log', 'paths', pathsToUpload);
        try {
          win.webContents.debugger.attach('1.1');
        } catch (e) {
          parent.emit('log', 'problem attaching', e);
          return done(e);
        }

        win.webContents.debugger.sendCommand('DOM.getDocument', {}, function(err, domDocument) {
          win.webContents.debugger.sendCommand('DOM.querySelector', {
            nodeId: domDocument.root.nodeId,
            selector: selector
          }, function(err, queryResult) {
            if (Object.keys(err)
              .length > 0) {
              parent.emit('log', 'problem selecting', err);
              return done(err);
            }
            win.webContents.debugger.sendCommand('DOM.setFileInputFiles', {
              nodeId: queryResult.nodeId,
              files: pathsToUpload
            }, function(err, setFileResult) {
              if (Object.keys(err)
                .length > 0) {
                parent.emit('log', 'problem setting input', err);
                return done(err);
              }
              win.webContents.debugger.detach();
              done(null, pathsToUpload);
            });
          });
        });
      });
      done();
    },
    function(selector, pathsToUpload, done) {
      if(!Array.isArray(pathsToUpload)){
        pathsToUpload = [pathsToUpload];
      }
      this.child.call('upload', selector, pathsToUpload, (err, stuff) => {
        done(err, stuff);
      });
    })
}
