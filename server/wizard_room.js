var Room = require('colyseus').Room

class WizardRoom extends Room {
  constructor(options) {
    // call 'update' method each 50ms
    super(options)

    this.channel = options.channel;

    this.setPatchRate(1000 / 20);

    this.setState({
      Green: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Blue: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Yellow: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Pink: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Red: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      numNonGems: 31,
      started: false
    })
  }

  requestJoin(options) {
    return options.channel === this.channel;
  }

  onJoin(client) {
    console.log(client.id, "joined ChatRoom!");
  }

  onMessage(client, data) {
    console.log(client.id, "sent message on ChatRoom");
    this.state = data;
    console.log(this.state);
  }

  onLeave(client) {
    console.log(client.id, "left ChatRoom");
  }
}

module.exports = WizardRoom
