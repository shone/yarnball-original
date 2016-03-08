var Users        = require('./users');
var Web_SocketIO = require('core/web-socketio');
var SocketioJwt  = require('socketio-jwt');
var UnauthorizedError = require('socketio-jwt/lib/UnauthorizedError');
var Node         = require('core/node');

function Users_SocketIO(users, socketio) {
  this._users    = users;
  this._socketio = socketio;
  this._userNamespaces = new Map();
  socketio.on('connection', this._onConnection.bind(this));
}

Users_SocketIO.prototype.setup = function() {
  var self = this;
  
  return self._users.getUsernodes()
  
  .then(function(usernodes) {
    return Promise.all(usernodes.map(function(usernode) {
      return self._createUserNamespace(usernode).then(function(userNamespace) {
        self._userNamespaces.set(Node.toHex(usernode), userNamespace);
      });
    }));
  })
}

Users_SocketIO.prototype._onConnection = function(connection) {
  connection.on('hasUsernode',       this._hasUsernode.bind(this));
  connection.on('hasUsername',       this._hasUsername.bind(this));
  connection.on('createUser',        this._createUser.bind(this));
  connection.on('login',             this._login.bind(this));
  connection.on('validateUserToken', this._validateUserToken.bind(this));
}

Users_SocketIO.prototype._hasUsernode = function(usernode, callback) {
  this._users.hasUsernode(Node.fromHex(usernode))
  
  .then(function(hasUsernode) {
    callback(hasUsernode);
  })
  
  .catch(function(error) {
    callback({error: error});
  });
}

Users_SocketIO.prototype._hasUsername = function(username, callback) {
  this._users.hasUsername(username)
  
  .then(function(hasUsername) {
    callback(hasUsername);
  })
  
  .catch(function(error) {
    callback({error: error});
  });
}

Users_SocketIO.prototype._createUser = function(params, callback) {
  var self = this;
  
  var usernode = null;
  
  self._users.createUser(params.username, params.passwordHash)
  
  .then(function(usernode_) {
    usernode = usernode_;
    return self._createUserNamespace(usernode_);
  })
  
  .then(function(userNamespace) {
    var token = self._users.createUserToken(usernode, params.username);
    callback({usernode: Node.toHex(usernode), token: token});
  })
  
  .catch(function(error) {
    callback({error: error});
  });
}

Users_SocketIO.prototype._login = function(params, callback) {
  var self = this;
  
  self._users.getUserForName(params.username)
  
  .then(function(user) {
    if (params.passwordHash !== user.passwordHash) {
      throw 'Invalid username/password.';
    }
    
    var token = self._users.createUserToken(user.usernode);
    callback({usernode: Node.toHex(user.usernode), username: user.username, token: token});
  })
  
  .catch(function(error) {
    callback({error: 'Invalid username/password.'});
  });
}

Users_SocketIO.prototype._createUserNamespace = function(usernode) {
  var self = this;
  
  return self._users.getUserWeb(usernode).then(function(userWeb) {
    var namespace = self._socketio.of('/' + Node.toHex(usernode));
    
    namespace.use(SocketioJwt.authorize({
      secret: Users.tokenCertificate,
      handshake: true,
      success: function(data, accept) {
        if (data.decoded_token.usernode !== Node.toHex(usernode)) {
          console.log('Client authorized only for user "' + data.decoded_token.username + '" attempted to connect to user "' + Node.toHex(usernode) + '".');
          accept(new UnauthorizedError('not_authorized_for_user', {message: 'Not authorized for this user.'}));
        } else {
          accept();
        }
      },
    }));
    
    namespace.on('connection', function(connection) {
      console.log('Client connected to user namespace "' + Node.toHex(usernode) + '".');
      var webServer = Web_SocketIO.Server(connection, userWeb);
    });
    
    namespace.on('error', function(error) {
      console.log(error);
    });
    
    return namespace;
  });
}

Users_SocketIO.prototype._validateUserToken = function(params, callback) {
  if (!('usernode' in params)) {
    callback({error: 'Cannot valididate token, usernode not given.'});
    return;
  }
  
  this._users.validateUserToken(Node.fromHex(params.usernode), params.token)
  
  .then(function(isValid) {
    callback(isValid);
  })
  
  .catch(function(error) {
    callback({error: error});
  });
}

module.exports = function(users, socketio) {
  return new Users_SocketIO(users, socketio);
}