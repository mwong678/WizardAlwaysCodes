var colyseus = require('colyseus'),
  WizardRoom = require('./wizard_room'),
  http = require('http'),
  express = require('express'),
  port = process.env.PORT || 2657,
  app = express();

var server = http.createServer(app),
  gameServer = new colyseus.Server({
    server: server
  })

gameServer.register('wizard', WizardRoom)

app.use(express.static(__dirname));
server.listen(port);

console.log(`Listening on http://localhost:${ port }`)
