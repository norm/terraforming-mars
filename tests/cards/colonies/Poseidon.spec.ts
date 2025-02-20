import {expect} from 'chai';
import {Poseidon} from '../../../src/cards/colonies/Poseidon';
import {Ceres} from '../../../src/colonies/Ceres';
import {Game} from '../../../src/Game';
import {Resources} from '../../../src/common/Resources';
import {TestPlayer} from '../../TestPlayer';

// TODO: add a test for Posideon's initial action.

describe('Poseidon', function() {
  it('Should play', function() {
    const card = new Poseidon();
    const player = TestPlayer.BLUE.newPlayer();
    const player2 = TestPlayer.RED.newPlayer();
    Game.newInstance('gameid', [player, player2], player);
    const play = card.play();
    expect(play).is.undefined;
    player.setCorporationForTest(card);
    const ceres = new Ceres();
    ceres.addColony(player);
    expect(player.getProduction(Resources.MEGACREDITS)).to.eq(1);
    expect(player.getProduction(Resources.STEEL)).to.eq(1);
  });
});
