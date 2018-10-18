import React from "react";
import {render, findDOMNode} from 'react-dom';
import Colyseus from 'colyseus.js';

class Main extends React.Component {

  constructor() {
    super();

    // use current hostname/port as colyseus server endpoint
    var endpoint = location.protocol.replace("http", "ws") + "//" + location.hostname;

    // development server
    if (location.port && location.port !== "80") { endpoint += ":2657" }

    this.colyseus = new Colyseus(endpoint)
    this.chatRoom = this.colyseus.join('wizard', { channel: window.location.hash || "#default" })
    this.chatRoom.on('update', this.onUpdateRemote.bind(this))

    this.state = {
      Green: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Blue: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Yellow: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Pink: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      Red: { name: "", numDraws: 1, numGems: 0, probabilityRate: 0 },
      numNonGems: 31,
      started: false
    };
  }

  onUpdateRemote (newState, patches) {
    this.setState(newState);
  }

  onInputChange (e) {
    e.preventDefault()
    let id = e.target.id;
    let ZERO = (0).toFixed(2);
    switch (id){
      case "Green":
        this.setState({ Green: {name: e.target.value, numDraws: 1, numGems: 0, probabilityRate: ZERO } })
        break;
      case "Blue":
        this.setState({ Blue: {name: e.target.value, numDraws: 1, numGems: 0, probabilityRate: ZERO } })
        break;
      case "Yellow":
        this.setState({ Yellow: {name: e.target.value, numDraws: 1, numGems: 0, probabilityRate: ZERO } })
        break;
      case "Red":
        this.setState({ Red: {name: e.target.value, numDraws: 1, numGems: 0, probabilityRate: ZERO } })
        break;
      case "Pink":
        this.setState({ Pink: {name: e.target.value, numDraws: 1, numGems: 0, probabilityRate: ZERO } })
        break;
    }
  }

  startGame(e) {
    e.preventDefault()
    if (Object.keys(this.returnCurrentPlayers()).length < 2){
      alert("Not enough players!");
      return;
    }
    if (this.hasDuplicates(this.returnCurrentPlayers())){
      alert("Cannot have duplicate players!");
      return;
    }
    this.state.started = true;
    this.chatRoom.send(this.state);
  }

  hasDuplicates(players) {
    let count = [];
    for (var key in players) {
      if (count[players[key]] === 1) {
        return true;
      }
      count[players[key]] = 1;
    }
    return false;
  }

  minus(e) {
    e.preventDefault();
    this.setState({
      numNonGems: --this.state.numNonGems
    });
    for (var key in this.returnCurrentPlayers()) {
      this.updateProbability(key);
    }
  }

  plus(e) {
    e.preventDefault();
    this.setState({
      numNonGems: ++this.state.numNonGems
    });
    for (var key in this.returnCurrentPlayers()) {
      this.updateProbability(key);
    }
  }

  updateProbability(color){
    let p = this.calculateProbability(this.state[color].numDraws, this.state[color].numGems);
    this.state[color].probabilityRate = (((p[0] + p[1]) * 100) / 2).toFixed(2);
    this.chatRoom.send(this.state);
    console.log(color + " Best/Worst is " + (p[0]*100).toFixed(2) + "/" + (p[1]*100).toFixed(2));
  }

  calculateProbability(numDraws, numGems){
    let best = 0.0, worst = 0.0;
    let denom = this.state.numNonGems + this.state.Green.numGems + this.state.Blue.numGems +
                this.state.Yellow.numGems + this.state.Red.numGems + this.state.Pink.numGems;
    for (var i = 0; i < numDraws; i++){
      best += (numGems / (denom - i));
      worst += (numGems / denom);
    }
    return [best, worst];
  }

  createTable(){
    let table = [];
    let players = this.returnCurrentPlayers();
    var children = [];
    children.push(<td key="playerNameElement"><h4 key="playerNameTitle">Player</h4></td>);
    children.push(<td key="drawElement"><h4 key="drawTitle">Draw</h4></td>);
    children.push(<td key="gemsElement"><h4 key="gemsTitle">Gems</h4></td>);
    children.push(<td key="probabilityElement"><h4 key="probabilityTitle">Probability</h4></td>);
    table.push(<tr key="title_row">{children}</tr>);
    for (var i in players){
      children = [];
      let rowName = players[i];
        let dropdown = [];
        children.push(<td key={rowName + "_name"}><p key={i}>{players[i]}</p></td>);
        for (var p = 0; p < 2; p++){
          let kids =[];
          var type = (p == 0) ? "numDraws" : "numGems";
          let m = (p == 0) ? 1 : 0;
          let currColor = this.returnColor(rowName, players);
          let selectedItem = this.state[currColor][type];
          for (var q = m; q < 11; q++){
            kids.push(<option key={type+"_"+q} value={q}>{q}</option>)
          }
          children.push(<td key={type+"_td"}><select value={selectedItem} onChange={this.onDropDownChange.bind(this)} key={type+"_select"} id={rowName+"_"+type}>{kids}</select></td>);
        }
        children.push(<td key="probabilityElement"><p key="probabilityTitle">{this.state[i].probabilityRate}%</p></td>);

      table.push(<tr key={rowName+"_row_"+i}>{children}</tr>);
    }
    children = [];
    children.push(<td key="nonGemTitle" colSpan="4"><h4 key="drawTitle"># of Non-Gem Tokens</h4></td>);
    table.push(<tr key="nonGem_row">{children}</tr>)
    children = [];
    children.push(<td key="nonGem" colSpan="4"><button id="minusButton" key= "minusButton" onClick={this.minus.bind(this)} >-</button><p id="numChange">{this.state.numNonGems}</p><button id="plusButton" key="plusButton" onClick={this.plus.bind(this)}>+</button></td>);
    table.push(<tr key="nonGem_row2">{children}</tr>)

    return table;
  }

  returnColor(name, list) {
    for (var key in list) {
      if (list[key] === name) {
        return key;
      }
    }
    return undefined;
  }

  onDropDownChange(e) {
    e.preventDefault();
    let name = e.target.id.split("_")[0];
    let type = e.target.id.split("_")[1];
    let value = parseInt(e.target.value, 10);
    let players = this.returnCurrentPlayers();
    let currColor = this.returnColor(name, players);
    this.state[currColor][type] = value;
    for (var key in players) {
      this.updateProbability(key);
    }
  }

  returnCurrentPlayers() {
    let players = {
      Green: this.state.Green.name,
      Blue: this.state.Blue.name,
      Yellow: this.state.Yellow.name,
      Pink: this.state.Red.name,
      Red: this.state.Pink.name
    };
    for (var key in players) {
      if (players[key] == '') {
        delete players[key];
      }
    }
    return players;
  }

  render() {
    if (this.state.started){
      return (<div>
      <h1 id="title">Wizard Always Codes</h1>
      <br />
      <div id="players" ref="players" key = "players">
        <table>
        <tbody>
        {this.createTable()}
        </tbody>
        </table>
      </div>
      </div>);
    }else{
      return (<div>
      <h1 id="title">Wizard Always Codes</h1>
      <br />
      <p id="instructions">Please enter names of players.</p>
      <div>
      <p>Green: </p>
      <input type="text" id="Green" onChange={this.onInputChange.bind(this)} value={this.state.Green.name} /> <br />
      </div>
      <div>
      <p>Blue: </p>
      <input type="text" id="Blue" onChange={this.onInputChange.bind(this)} value={this.state.Blue.name} /> <br />
      </div>
      <div>
      <p>Yellow: </p>
      <input type="text" id="Yellow" onChange={this.onInputChange.bind(this)} value={this.state.Yellow.name} /> <br />
      </div>
      <div>
      <p>Red: </p>
      <input type="text" id="Red" onChange={this.onInputChange.bind(this)} value={this.state.Red.name} /> <br />
      </div>
      <div>
      <p>Pink: </p>
      <input type="text" id="Pink" onChange={this.onInputChange.bind(this)} value={this.state.Pink.name} /> <br /> <br />
      </div>
      <button id="startButton" onClick={this.startGame.bind(this)} >Start Game</button>
      <div>
      <br />
      <img src="favorita.png" alt="Favorita Holiday" height="20%" width="20%" />
      </div>
      </div>);
    }
  }
}

render((
  <Main/>
), document.getElementById('main'));
