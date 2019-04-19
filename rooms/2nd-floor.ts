import { WorldInteractable, ActionState, TransitionState } from "../main";

export default {
    "id": "2nd floor",
    "states": {
        "initial": {
            "onActivate": "Your`re on the 2nd floor",
            "description": "Your`re on the 2nd floor. There are an apartment door here. Stairs go down to first floor."
        }
    },
    "items": {
        "rug": {
            "states": {
                "1": {
                    "description": "An old rug outside an apartment door."
                },
                "moved": {
                    "onActivate": "You move the rug out of the way, exposing a letterbox-key.",
                    "description": "An old rug, moved out of the way.",
                    "items": {
                        "letterbox-key": {}
                    }
                }
            },
            "actions": {
                "move": (state:ActionState): TransitionState | void => {
                    return { nextState: 'moved' };
                },
                "check": (state:ActionState): TransitionState | void => {
                    return { nextState: 'moved' };
                },
                "get": (state:ActionState): TransitionState | void => {
                    console.log('You would`nt want that');
                },
            }
        },
        "letterbox-key": {
            "states": {
                "1": {
                    "description": "It´s a key.",
                    "isAvailable": (state:ActionState): boolean => {
                        return state.room.items.rug.states.moved.active && !state.inventory['letterbox-key'];
                    }
                }
            },
            "actions": {
                "get": (state:ActionState): TransitionState | void => {
                    if (state.inventory['letterbox-key']) {
                        console.log('You already picked it up.');
                        return;
                    }
                    return { addInventory: ['letterbox-key'] };
                }
            }
        },
        "door": {
            "states": {
                "1": {
                    "description": "\"Mr. Smith\""
                }
            }
        }
    },
    "actions": {
        "down": (state:ActionState): TransitionState | void => {
            return { nextRoom: '1st floor' };
        }
    }
} as WorldInteractable;