<template>
  <v-list-item class="listItem" :dense="dense" :two-line="Number(line)===2" :three-line="Number(line)===3"
               :target="targetValue" :replace="replace" :href="hrefValue" :to="toValue" :link="isLink" :value="value"
  >
    <slot name="left"> <!--Item左边--> </slot>
    <v-list-item-icon v-if="$slots.icon || $notEmpty(icon)">
      <v-icon v-if="$notEmpty(icon)" :size="iconSize" :color="iconColor">{{icon}}</v-icon>
      <slot name="icon"/>
    </v-list-item-icon>
    <v-list-item-content
        v-if="$slots.default || $slots.content || $slots.title || $slots.subtitle || $notEmpty(itemTitle) || $notEmpty(itemSubtitle)">
      <!--上下排列的内容-->
      <v-list-item-title v-if="$slots.title || $notEmpty(itemTitle)">
        {{itemTitle}}
        <slot name="title"></slot>
      </v-list-item-title>
      <v-list-item-subtitle v-if="$slots.subtitle || $notEmpty(itemSubtitle)">
        {{itemSubtitle}}
        <slot name="subtitle"/>
      </v-list-item-subtitle>
      <slot/>
    </v-list-item-content>
    <v-list-item-action v-if="$slots.action || $slots.actionText || $notEmpty(actionText)">
      <v-list-item-action-text v-if="$notEmpty(actionText) || $slots.actionText">
        {{actionText}}
        <slot name="actionText"/>
      </v-list-item-action-text>
      <slot name="action"/>
    </v-list-item-action>
    <slot name="right"><!--Item右边--></slot>
  </v-list-item>
</template>

<script>

  export default {
    name: "listItem",
    props: {
      to: {
        type: String,
      },
      replace: {
        type: Boolean,
      },
      href: {
        type: String,
      },
      link: {
        type: String,
      },
      outChain: {
        type: Boolean,
      },
      target: {
        type: String,
      },
      isLink: {
        type: Boolean,
      },
      value: {
        type: [String, Number],
      },
      actionText: {
        type: String,
      },
      icon: {
        type: String,
      },
      iconSize: {
        type: String,
      },
      iconColor: {
        type: String,
      },
      itemTitle: {
        type: String,
      },
      itemSubtitle: {
        type: String,
      },
      dense: {
        type: Boolean,
      },
      line: {
        type: [Number, String],
      },
    },
    computed: {
      targetValue() {
        if (this.target!==undefined) return this.target;
        else if (this.outChain===true) return "_blank";
        else return undefined
      },
      hrefValue() {
        if (this.href!==undefined) return this.href;
        else if (this.outChain===true) return this.link;
        else if (this.outChain===false && this.link && this.link.indexOf('://')!==-1) return this.link;
        else return undefined
      },
      toValue() {
        if (this.to!==undefined) return this.to;
        else if (this.outChain===false && this.link && this.link.indexOf('://')===-1) return this.link;
        else return undefined
      }
    },
    data() {
      return {}
    },
    mounted() {
      // console.log(this.$slots);
    },
  }
</script>

<style lang="scss">

</style>
