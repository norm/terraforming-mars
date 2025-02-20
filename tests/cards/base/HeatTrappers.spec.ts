import {expect} from 'chai';
import {HeatTrappers} from '../../../src/cards/base/HeatTrappers';
import {Game} from '../../../src/Game';
import {SelectPlayer} from '../../../src/inputs/SelectPlayer';
import {TestPlayer} from '../../TestPlayer';
import {Resources} from '../../../src/common/Resources';

describe('HeatTrappers', function() {
  let card: HeatTrappers;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: Game;

  beforeEach(function() {
    card = new HeatTrappers();
    player = TestPlayer.BLUE.newPlayer();
    player2 = TestPlayer.RED.newPlayer();
    game = Game.newInstance('gameid', [player, player2], player);
  });

  it('Should be playable in solo mode', function() {
    game = Game.newInstance('gameid', [player], player);
    player.addProduction(Resources.HEAT, 1);

    expect(card.canPlay(player)).is.true;
    card.play(player);

    expect(player.getProduction(Resources.HEAT)).to.eq(1); // Not changed
    expect(card.getVictoryPoints()).to.eq(-1);
    expect(player.getProduction(Resources.ENERGY)).to.eq(1); // Incremented
  });

  it('Should play - auto select if single target', function() {
    player2.addProduction(Resources.HEAT, 7);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.getProduction(Resources.ENERGY)).to.eq(1);

    const input = game.deferredActions.peek()!.execute();
    expect(input).is.undefined;
    expect(player2.getProduction(Resources.HEAT)).to.eq(5);
  });

  it('Should play - multiple targets', function() {
    player.addProduction(Resources.HEAT, 3);
    player2.addProduction(Resources.HEAT, 7);
    card.play(player);

    expect(player.getProduction(Resources.ENERGY)).to.eq(1);

    expect(game.deferredActions).has.lengthOf(1);
    const selectPlayer = game.deferredActions.peek()!.execute() as SelectPlayer;
    selectPlayer.cb(player2);
    expect(player2.getProduction(Resources.HEAT)).to.eq(5);
  });

  it('Can not play if nobody has heat production', function() {
    expect(card.canPlay(player)).is.not.true;
  });

  it('Gives victory points', function() {
    expect(card.getVictoryPoints()).to.eq(-1);
  });
});
