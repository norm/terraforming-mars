import {expect} from 'chai';
import {MediaGroup} from '../../../src/cards/base/MediaGroup';
import {Virus} from '../../../src/cards/base/Virus';
import {Game} from '../../../src/Game';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';

describe('MediaGroup', function() {
  it('Should play', function() {
    const card = new MediaGroup();
    const player = TestPlayer.BLUE.newPlayer();
    const redPlayer = TestPlayer.RED.newPlayer();
    const game = Game.newInstance('gameid', [player, redPlayer], player);
    const action = card.play();
    expect(action).is.undefined;

    card.onCardPlayed(player, new Virus());

    runAllActions(game);

    expect(player.megaCredits).to.eq(3);

    card.onCardPlayed(player, card);
    runAllActions(game);

    expect(player.megaCredits).to.eq(3);
  });
});
