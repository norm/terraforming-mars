import {CardName} from '../../CardName';
import {CardType} from '../CardType';
import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {Units} from '../../Units';
import {MoonExpansion} from '../../moon/MoonExpansion';
import {Player} from '../../Player';

export class SubterraneanHabitats extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SUBTERRANEAN_HABITATS,
      cardType: CardType.ACTIVE,
      cost: 12,

      metadata: {
        description: 'Spend 2 steel. Raise the Colony Rate 1 step.',
        cardNumber: 'M36',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you build a colony on the Moon, you spend 1 titanium less.', (eb) => {
            eb.startEffect.moonColony().colon().minus().titanium(1);
          });
          b.minus().steel(2).moonColonyRate(1);
        }),
      },
    });
  };

  public reserveUnits = Units.of({steel: 2});

  public canPlay(): boolean {
    return true;
  }

  public play(player: Player) {
    Units.deductUnits(this.reserveUnits, player);
    MoonExpansion.raiseColonyRate(player);
    return undefined;
  }
}
