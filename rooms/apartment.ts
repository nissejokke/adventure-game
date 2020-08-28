import { WorldInteractable, ActionState, TransitionState } from "../main";

export default {
  id: "apartment",
  description: "Black hole",
  states: {
    initial: {
      onActivate: "You stepped into a black hole, there is nothing you can do",
      description: "The dark hole will forever confine you.",
    },
  },
  items: {
    blackhole: {
      states: {
          initial: {
              description: "A super massive black hole, nothing more, nothing less."
          }
      },
      actions: {
        "*": () => {
          console.log("You try to reach it but it´s to far away");
        },
      },
    },
  },
  actions: {},
} as WorldInteractable;
