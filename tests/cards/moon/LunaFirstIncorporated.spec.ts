import {expect} from 'chai';
import {Game} from '../../../src/Game';
import {setCustomGameOptions} from '../../TestingUtils';
import {LunaFirstIncorporated} from '../../../src/cards/moon/LunaFirstIncorporated';
import {MoonExpansion} from '../../../src/moon/MoonExpansion';
import {TestPlayer} from '../../TestPlayer';
import {Resources} from '../../../src/common/Resources';

const MOON_OPTIONS = setCustomGameOptions({moonExpansion: true});

describe('LunaFirstIncorporated', () => {
  let player: TestPlayer;
  let otherPlayer: TestPlayer;
  let card: LunaFirstIncorporated;

  beforeEach(() => {
    player = TestPlayer.BLUE.newPlayer();
    otherPlayer = TestPlayer.RED.newPlayer();
    Game.newInstance('gameid', [player, otherPlayer], player, MOON_OPTIONS);
    card = new LunaFirstIncorporated();
  });

  it('effect', () => {
    card.play(player);

    // Case 1
    player.setProductionForTest({megacredits: 0});
    player.megaCredits = 0;

    MoonExpansion.raiseMiningRate(otherPlayer, 1);
    expect(player.megaCredits).eq(1);
    expect(player.getProduction(Resources.MEGACREDITS)).eq(0);

    // Case 2
    player.setProductionForTest({megacredits: 0});
    player.megaCredits = 0;

    MoonExpansion.raiseColonyRate(otherPlayer, 2);
    expect(player.megaCredits).eq(2);
    expect(player.getProduction(Resources.MEGACREDITS)).eq(0);

    // Case 3
    player.setProductionForTest({megacredits: 0});
    player.megaCredits = 0;

    MoonExpansion.raiseLogisticRate(player, 1);
    expect(player.megaCredits).eq(1);
    expect(player.getProduction(Resources.MEGACREDITS)).eq(1);

    // Case 4
    player.setProductionForTest({megacredits: 0});
    player.megaCredits = 0;

    MoonExpansion.raiseMiningRate(player, 2);
    expect(player.megaCredits).eq(2);
    expect(player.getProduction(Resources.MEGACREDITS)).eq(2);
  });
});

