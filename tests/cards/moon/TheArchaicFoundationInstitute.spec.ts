import {Game} from '../../../src/Game';
import {setCustomGameOptions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {TheArchaicFoundationInstitute} from '../../../src/cards/moon/TheArchaicFoundationInstitute';
import {expect} from 'chai';
import {MicroMills} from '../../../src/cards/base/MicroMills';
import {HE3ProductionQuotas} from '../../../src/cards/moon/HE3ProductionQuotas';
import {LunaTradeStation} from '../../../src/cards/moon/LunaTradeStation';
import {CosmicRadiation} from '../../../src/cards/moon/CosmicRadiation';
import {GeodesicTents} from '../../../src/cards/moon/GeodesicTents';
import {DeepLunarMining} from '../../../src/cards/moon/DeepLunarMining';
import {Habitat14} from '../../../src/cards/moon/Habitat14';

const MOON_OPTIONS = setCustomGameOptions({moonExpansion: true});

describe('TheArchaicFoundationInstitute', () => {
  let player: TestPlayer;
  let card: TheArchaicFoundationInstitute;

  beforeEach(() => {
    player = TestPlayer.BLUE.newPlayer();
    Game.newInstance('gameid', [player], player, MOON_OPTIONS);
    card = new TheArchaicFoundationInstitute();
  });

  it('effect', () => {
    player.setCorporationForTest(card);
    card.resourceCount = 0;
    expect(player.getTerraformRating()).eq(14);

    card.onCardPlayed(player, new MicroMills());
    expect(card.resourceCount).eq(0);
    expect(player.getTerraformRating()).eq(14);

    card.onCardPlayed(player, new HE3ProductionQuotas());
    expect(card.resourceCount).eq(1);
    expect(player.getTerraformRating()).eq(14);

    card.onCardPlayed(player, new CosmicRadiation());
    expect(card.resourceCount).eq(2);
    expect(player.getTerraformRating()).eq(14);

    card.onCardPlayed(player, new GeodesicTents());
    expect(card.resourceCount).eq(0);
    expect(player.getTerraformRating()).eq(15);

    card.onCardPlayed(player, new DeepLunarMining());
    expect(card.resourceCount).eq(1);
    expect(player.getTerraformRating()).eq(15);


    card.onCardPlayed(player, new Habitat14());
    expect(card.resourceCount).eq(2);
    expect(player.getTerraformRating()).eq(15);

    // Two moon tags
    card.onCardPlayed(player, new LunaTradeStation());
    expect(card.resourceCount).eq(1);
    expect(player.getTerraformRating()).eq(16);
  });
});

