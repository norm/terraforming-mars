import {expect} from 'chai';
import {Odyssey} from '../../../src/cards/pathfinders/Odyssey';
import {Game} from '../../../src/Game';
import {TestPlayer} from '../../TestPlayer';
import {getTestPlayer, newTestGame} from '../../TestGame';
import {cast, fakeCard, runAllActions} from '../../TestingUtils';
import {Tags} from '../../../src/common/cards/Tags';
import {CardType} from '../../../src/common/cards/CardType';
import {ImportOfAdvancedGHG} from '../../../src/cards/base/ImportOfAdvancedGHG';
import {InventionContest} from '../../../src/cards/base/InventionContest';
import {SelectHowToPayForProjectCard} from '../../../src/inputs/SelectHowToPayForProjectCard';
import {Resources} from '../../../src/common/Resources';
import {MediaGroup} from '../../../src/cards/base/MediaGroup';
import {IceCapMelting} from '../../../src/cards/base/IceCapMelting';
import {HowToPay} from '../../../src/common/inputs/HowToPay';

describe('Odyssey', () => {
  let card: Odyssey;
  let player: TestPlayer;
  let game: Game;

  beforeEach(() => {
    card = new Odyssey();
    game = newTestGame(1);
    player = getTestPlayer(game, 0);
    player.setCorporationForTest(card);
  });

  it('events count for tags', () => {
    const event = fakeCard({cardType: CardType.EVENT, tags: [Tags.JOVIAN]});
    player.playedCards.push(event);
    expect(player.getTagCount(Tags.JOVIAN)).eq(1);
    player.setCorporationForTest(undefined);
    expect(player.getTagCount(Tags.JOVIAN)).eq(0);
  });

  it('cannot act - cannot afford', () => {
    const expensiveEvent = fakeCard({cardType: CardType.EVENT, cost: 8});
    player.playedCards = [expensiveEvent];
    expect(card.canAct(player)).is.false;
    player.megaCredits = 7;
    expect(card.canAct(player)).is.false;
    player.megaCredits = 8;
    expect(card.canAct(player)).is.true;
  });

  it('cannot act - cannot meet requirements', () => {
    // Requires +2C temperature.
    const event = new IceCapMelting();
    player.megaCredits = event.cost;
    player.playedCards = [event];
    expect(card.canAct(player)).is.false;
    (game as any).temperature = 0;
    expect(card.canAct(player)).is.false;
    (game as any).temperature = 2;
    expect(card.canAct(player)).is.true;
  });

  it('can act', () => {
    player.megaCredits = 50;
    expect(card.canAct(player)).is.false;
    const expensiveEvent = fakeCard({cardType: CardType.EVENT, cost: 17});
    const nonEvent = fakeCard({cardType: CardType.ACTIVE, cost: 2});
    player.playedCards = [expensiveEvent, nonEvent];
    expect(card.canAct(player)).is.false;
    expensiveEvent.cost = 16;
    expect(card.canAct(player)).is.true;
  });

  it('action', () => {
    // Costs 9. Raise heat 2 steps,
    const importOfAdvancedGHG = new ImportOfAdvancedGHG();
    // Costs 2. Look at the top 3 cards from the deck. Take 1 of them into hand and discard the other two.
    const inventionContest = new InventionContest();
    player.playedCards = [importOfAdvancedGHG, inventionContest];

    let selectCard = cast(card.action(player), SelectHowToPayForProjectCard);

    expect(selectCard.cards).is.empty;

    player.megaCredits = 4;
    selectCard = cast(card.action(player), SelectHowToPayForProjectCard);
    expect(selectCard.cards).has.members([inventionContest]);

    player.megaCredits = 9;
    selectCard = cast(card.action(player), SelectHowToPayForProjectCard);
    expect(selectCard.cards).has.members([importOfAdvancedGHG, inventionContest]);

    expect(player.playedCards).has.members([importOfAdvancedGHG, inventionContest]);
    expect(player.getProduction(Resources.HEAT)).eq(0);

    selectCard.cb(importOfAdvancedGHG, {...HowToPay.EMPTY, megaCredits: importOfAdvancedGHG.cost});
    runAllActions(game);

    expect(player.getProduction(Resources.HEAT)).eq(2);
    expect(game.dealer.discarded.pop()).eq(importOfAdvancedGHG);
    expect(player.playedCards).has.members([inventionContest]);
    expect(player.megaCredits).eq(0);
  });

  it('action triggers related effects', () => {
    const importOfAdvancedGHG = new ImportOfAdvancedGHG();
    const mediaGroup = new MediaGroup();
    player.megaCredits = 50;

    player.playedCards = [importOfAdvancedGHG, mediaGroup];
    const selectCard = cast(card.action(player), SelectHowToPayForProjectCard);

    expect(player.getProduction(Resources.HEAT)).eq(0);
    expect(player.megaCredits).eq(50);

    selectCard.cb(importOfAdvancedGHG, {...HowToPay.EMPTY, megaCredits: 9});
    runAllActions(game);

    expect(player.getProduction(Resources.HEAT)).eq(2);
    expect(player.megaCredits).eq(44); // 50 - 9 + 3 = 44
    expect(game.dealer.discarded.pop()).eq(importOfAdvancedGHG);
    expect(player.playedCards).has.members([mediaGroup]);
  });
});
