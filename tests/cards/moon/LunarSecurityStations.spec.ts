import {Game} from '../../../src/Game';
import {IMoonData} from '../../../src/moon/IMoonData';
import {MoonExpansion} from '../../../src/moon/MoonExpansion';
import {Player} from '../../../src/Player';
import {cast, setCustomGameOptions} from '../../TestingUtils';
import {LunarSecurityStations} from '../../../src/cards/moon/LunarSecurityStations';
import {expect} from 'chai';
import {OrOptions} from '../../../src/inputs/OrOptions';
import {HiredRaiders} from '../../../src/cards/base/HiredRaiders';
import {TileType} from '../../../src/common/TileType';
import {TestPlayer} from '../../TestPlayer';

const MOON_OPTIONS = setCustomGameOptions({moonExpansion: true});

describe('LunarSecurityStations', () => {
  let game: Game;
  let player: Player;
  let opponent1: Player;
  let opponent2: Player;
  let moonData: IMoonData;
  let card: LunarSecurityStations;

  beforeEach(() => {
    player = TestPlayer.BLUE.newPlayer();
    opponent1 = TestPlayer.RED.newPlayer();
    opponent2 = TestPlayer.GREEN.newPlayer();
    game = Game.newInstance('gameid', [player, opponent1, opponent2], player, MOON_OPTIONS);
    moonData = MoonExpansion.moonData(game);
    card = new LunarSecurityStations();
  });

  it('can play', () => {
    player.cardsInHand = [card];
    player.megaCredits = card.cost;

    const spaces = moonData.moon.getAvailableSpacesOnLand(player);
    spaces[0].tile = {tileType: TileType.MOON_ROAD};
    spaces[1].tile = {tileType: TileType.MOON_ROAD};
    spaces[2].tile = {tileType: TileType.MOON_ROAD};

    expect(player.getPlayableCards()).includes(card);

    spaces[1].tile = {tileType: TileType.MOON_COLONY};
    expect(player.getPlayableCards()).does.not.include(card);
  });

  it('protects against Hired Raiders', () => {
    opponent1.steel = 5;
    opponent2.steel = 5;

    const hiredRaiders = new HiredRaiders();

    opponent2.playedCards = [];
    let action = cast(hiredRaiders.play(player), OrOptions);
    // Options for both opponents.
    expect(action.options).has.lengthOf(3);

    opponent2.playedCards = [card];
    action = cast(hiredRaiders.play(player), OrOptions);
    // Options for only one opponent.
    expect(action.options).has.lengthOf(2);
    action.options[0].cb();
    // And it's the one without Luna Security Stations.
    expect(opponent1.steel).to.eq(3);
  });

  it('play', () => {
    expect(player.getTerraformRating()).eq(20);
    expect(moonData.logisticRate).eq(0);

    card.play(player);

    expect(moonData.logisticRate).eq(1);
    expect(player.getTerraformRating()).eq(21);
  });
});
