import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {PreludeCard} from '../prelude/PreludeCard';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {Turmoil} from '../../turmoil/Turmoil';
import {CardRenderer} from '../render/CardRenderer';

export class ByElection extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.BY_ELECTION,
      tags: [Tags.WILD],

      metadata: {
        cardNumber: 'Y02',
        renderData: CardRenderer.builder((b) => {
          b.rulingParty().plus().influence();
        }),
        description: 'Set the ruling party to one of your choice. Gain 1 influence.',
      },
    });
  }
  public override canPlay() {
    return true;
  }

  public play(player: Player) {
    Turmoil.ifTurmoil((player.game), (turmoil) => {
      turmoil.addInfluenceBonus(player);
      turmoil.chooseRulingParty(player);
    });

    return undefined;
  }
}
