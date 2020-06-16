class ArtPieceView extends React.Component {
  render() {
    return (
      <div>
        <div>Artist: {this.props.artPiece.artist}</div>
        <div>Auction Type: {this.props.artPiece.auctionType}</div>
      </div>
    );
  }
}

class CardsView extends React.Component {
  render() {
    return (
      <div>
        Number of cards: {this.props.cards.length}
        {this.props.cards.map(a => <ArtPieceView artPiece={a} />)}
      </div>
    );
  }
}

class PlayerView extends React.Component {
  render() {
    return (
      <div>
        <div>Name: {this.props.player.name}</div>
        <div>Index: {this.props.player.index}</div>
        <div>Cash: {this.props.player.cash}</div>
        <div>Hand: <CardsView cards={this.props.player.hand} /></div>
        <div>Board: <CardsView cards={this.props.player.board} /></div>
     </div>
    );
  }
}

class ModernArtView extends React.Component {
  render() {
    return (
      <div>
        Number of players: {this.props.game.players.length}
        {this.props.game.players.map(p => <PlayerView key={p.name} player={p} />)}
      </div>
    );
  }
}

class ModernArtGameRoom extends React.Component {
  render() {
    return (
      <div>
        <button>Create game</button>
        <div>Open games:</div>
      </div>
    );
  }
}

window.ModernArtView = ModernArtView;