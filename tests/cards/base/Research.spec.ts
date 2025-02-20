import {expect} from 'chai';
import {Research} from '../../../src/cards/base/Research';
import {Game} from '../../../src/Game';
import {TestPlayer} from '../../TestPlayer';

describe('Research', function() {
  it('Should play', function() {
    const card = new Research();
    const player = TestPlayer.BLUE.newPlayer();
    const redPlayer = TestPlayer.RED.newPlayer();
    Game.newInstance('gameid', [player, redPlayer], player);
    const action = card.play(player);
    expect(action).is.undefined;
    expect(card.getVictoryPoints()).to.eq(1);
    expect(player.cardsInHand).has.lengthOf(2);
    expect(player.cardsInHand[0]).not.to.eq(player.cardsInHand[1]);
  });
});
