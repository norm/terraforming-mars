<template>
  <div class="select-initial-cards">
    <confirm-dialog
      message="Continue without buying any project cards?"
      ref="confirmation"
      v-on:accept="confirmSelection" />
    <SelectCard :playerView="playerView" :playerinput="getOption(0)" :showtitle="true" :onsave="noop" v-on:cardschanged="corporationChanged" />
    <SelectCard v-if="hasPrelude()" :playerView="playerView" :playerinput="getOption(1)" :onsave="noop" :showtitle="true" v-on:cardschanged="preludesChanged" />
    <SelectCard :playerView="playerView" :playerinput="getOption(hasPrelude() ? 2 : 1)" :onsave="noop" :showtitle="true" v-on:cardschanged="cardsChanged" />
    <div v-if="selectedCorporation" v-i18n>Starting Megacredits: <div class="megacredits">{{getStartingMegacredits()}}</div></div>
    <div v-if="selectedCorporation && hasPrelude()" v-i18n>After Preludes: <div class="megacredits">{{getStartingMegacredits() + getAfterPreludes()}}</div></div>
    <Button v-if="showsave" @click="saveIfConfirmed" type="submit" :title="playerinput.buttonLabel" />
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {WithRefs} from 'vue-typed-refs';

import Button from '@/client/components/common/Button.vue';
import {getCard, getCardOrThrow} from '@/client/cards/ClientCardManifest';
import {CardName} from '@/common/cards/CardName';
import * as constants from '@/common/constants';
import {IClientCard} from '@/common/cards/IClientCard';
import {PlayerInputModel} from '@/common/models/PlayerInputModel';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import SelectCard from '@/client/components/SelectCard.vue';
import ConfirmDialog from '@/client/components/common/ConfirmDialog.vue';
import {IPreferences, PreferencesManager} from '@/client/utils/PreferencesManager';
import {Tags} from '@/common/cards/Tags';
import {InputResponse} from '@/common/inputs/InputResponse';
import {CardType} from '@/common/cards/CardType';

type Refs = {
  confirmation: InstanceType<typeof ConfirmDialog>,
}

export default (Vue as WithRefs<Refs>).extend({
  name: 'SelectInitialCards',
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
    },
    playerinput: {
      type: Object as () => PlayerInputModel,
    },
    onsave: {
      type: Function as unknown as () => (out: InputResponse) => void,
    },
    showsave: {
      type: Boolean,
    },
    showtitle: {
      type: Boolean,
    },
    preferences: {
      type: Object as () => Readonly<IPreferences>,
      default: () => PreferencesManager.INSTANCE.values(),
    },
  },
  components: {
    Button,
    SelectCard,
    'confirm-dialog': ConfirmDialog,
  },
  data() {
    return {
      selectedCards: [] as Array<CardName>,
      selectedCorporation: undefined as IClientCard | undefined,
      selectedPreludes: [] as Array<CardName>,
    };
  },
  methods: {
    noop() {
      throw new Error('should not be called');
    },
    getAfterPreludes() {
      let result = 0;
      for (const prelude of this.selectedPreludes) {
        const card = getCardOrThrow(prelude);
        result += card.startingMegaCredits ?? 0;

        switch (this.selectedCorporation?.name) {
        // For each step you increase the production of a resource ... you also gain that resource.
        case CardName.MANUTECH:
          result += card.productionBox?.megacredits ?? 0;
          break;

        // When you place a city tile, gain 3 M€.
        case CardName.THARSIS_REPUBLIC:
          switch (prelude) {
          case CardName.SELF_SUFFICIENT_SETTLEMENT:
          case CardName.EARLY_SETTLEMENT:
          case CardName.STRATEGIC_BASE_PLANNING:
            result += 3;
            break;
          }
          break;

        // When ANY microbe tag is played ... lose 4 M€ or as much as possible.
        case CardName.PHARMACY_UNION:
          const tags = card.tags.filter((tag) => tag === Tags.MICROBE).length;
          result -= (4 * tags);
          break;

        // when a microbe tag is played, incl. this, THAT PLAYER gains 2 M€,
        case CardName.SPLICE:
          const microbeTags = card.tags.filter((tag) => tag === Tags.MICROBE).length;
          result += (2 * microbeTags);
          break;

        // Whenever Venus is terraformed 1 step, you gain 2 M€
        case CardName.APHRODITE:
          switch (prelude) {
          case CardName.VENUS_FIRST:
          case CardName.VENUS_FIRST_PATHFINDERS:
            result += 4;
            break;
          case CardName.HYDROGEN_BOMBARDMENT:
            result += 2;
            break;
          }
          break;

        // When any player raises any Moon Rate, gain 1M€ per step.
        case CardName.LUNA_FIRST_INCORPORATED:
          switch (prelude) {
          case CardName.FIRST_LUNAR_SETTLEMENT:
          case CardName.CORE_MINE:
          case CardName.BASIC_INFRASTRUCTURE:
            result += 1;
            break;
          case CardName.MINING_COMPLEX:
            result += 2;
            break;
          }
          break;

        // When you place an ocean tile, gain 4MC
        case CardName.POLARIS:
          switch (prelude) {
          case CardName.AQUIFER_TURBINES:
          case CardName.POLAR_INDUSTRIES:
            result += 4;
            break;
          case CardName.GREAT_AQUIFER:
            result += 8;
            break;
          }
          break;
        }
      }
      return result;
    },
    getOption(idx: number) {
      if (this.playerinput.options === undefined || this.playerinput.options[idx] === undefined) {
        throw new Error('invalid input, missing option');
      }
      return this.playerinput.options[idx];
    },
    getStartingMegacredits() {
      if (this.selectedCorporation === undefined) {
        return NaN;
      }
      // The ?? 0 is only because IClientCard applies to _all_ cards.
      let starting = this.selectedCorporation.startingMegaCredits ?? 0;
      const cardCost = this.selectedCorporation.cardCost === undefined ? constants.CARD_COST : this.selectedCorporation.cardCost;
      starting -= this.selectedCards.length * cardCost;
      return starting;
    },
    saveIfConfirmed() {
      const projectCards = this.selectedCards.filter((name) => getCard(name)?.cardType !== CardType.PRELUDE);
      let showAlert = false;
      if (this.preferences.show_alerts && projectCards.length === 0) showAlert = true;
      if (showAlert) {
        this.$refs.confirmation.show();
      } else {
        this.saveData();
      }
    },
    saveData() {
      const result: InputResponse = [];
      result.push([]);
      if (this.selectedCorporation !== undefined) {
        result[0].push(this.selectedCorporation.name);
      }
      if (this.hasPrelude()) {
        result.push(this.selectedPreludes);
      }
      result.push(this.selectedCards);
      this.onsave(result);
    },
    hasPrelude() {
      return this.playerinput.options !== undefined && this.playerinput.options.length === 3;
    },
    cardsChanged(cards: Array<CardName>) {
      this.selectedCards = cards;
    },
    corporationChanged(cards: Array<CardName>) {
      this.selectedCorporation = getCard(cards[0]);
    },
    preludesChanged(cards: Array<CardName>) {
      this.selectedPreludes = cards;
    },
    confirmSelection() {
      this.saveData();
    },
  },
});

</script>

