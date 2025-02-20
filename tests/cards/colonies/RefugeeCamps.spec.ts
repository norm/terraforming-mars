import {expect} from 'chai';
import {RefugeeCamps} from '../../../src/cards/colonies/RefugeeCamps';
import {Player} from '../../../src/Player';
import {Resources} from '../../../src/common/Resources';
import {TestPlayer} from '../../TestPlayer';

describe('RefugeeCamps', function() {
  let card: RefugeeCamps;
  let player: Player;

  beforeEach(function() {
    card = new RefugeeCamps();
    player = TestPlayer.BLUE.newPlayer();
  });

  it('Should play', function() {
    const action = card.play();
    expect(action).is.undefined;

    player.addResourceTo(card, 5);
    expect(card.getVictoryPoints()).to.eq(5);
  });

  it('Can not act', function() {
    player.addProduction(Resources.MEGACREDITS, -5);
    expect(card.canAct(player)).is.not.true;
  });

  it('Should act', function() {
    expect(card.canAct(player)).is.true;
    card.action(player);
    expect(card.resourceCount).to.eq(1);
  });
});
