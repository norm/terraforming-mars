import {Game} from '../../../src/Game';
import {Player} from '../../../src/Player';
import {cast, setCustomGameOptions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {PreliminaryDarkside} from '../../../src/cards/moon/PreliminaryDarkside';
import {expect} from 'chai';
import {OrOptions} from '../../../src/inputs/OrOptions';

const MOON_OPTIONS = setCustomGameOptions({moonExpansion: true});

describe('PreliminaryDarkside', () => {
  let player: Player;
  let card: PreliminaryDarkside;

  beforeEach(() => {
    player = TestPlayer.BLUE.newPlayer();
    Game.newInstance('gameid', [player], player, MOON_OPTIONS);
    card = new PreliminaryDarkside();
  });

  it('can play', () => {
    player.cardsInHand = [card];
    player.megaCredits = card.cost;

    expect(player.getPlayableCards()).does.include(card);
  });

  it('play', () => {
    const action = cast(card.play(player), OrOptions);
    expect(action.options).has.lengthOf(2);

    player.titanium = 0;
    player.steel = 0;
    action.options[0].cb();

    expect(player.titanium).eq(3);
    expect(player.steel).eq(0);

    player.titanium = 0;
    player.steel = 0;
    action.options[1].cb();

    expect(player.titanium).eq(0);
    expect(player.steel).eq(4);
  });
});

