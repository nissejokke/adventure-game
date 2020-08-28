import { WorldInteractable, ActionState, TransitionState } from "../main";
import { nextTick } from "process";

export default {
    "id": "2nd floor",
    "states": {
        "initial": {
            "onActivate": "Your`re on the 2nd floor.\nThere are an apartment door here. Stairs go down to first floor.",
            "description": "Your`re on the 2nd floor.\nThere are an apartment door here with a doormat in front. Stairs go down to first floor."
        }
    },
    "items": {
        "doormat": {
            "states": {
                "1": {
                    "description": "An old doormat outside an apartment door."
                },
                "moved": {
                    "onActivate": "You move the doormat out of the way, exposing a small-key.",
                    "description": "An old doormat, moved out of the way.",
                    "items": {
                        "small-key": {}
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
                }
            }
        },
        "small-key": {
            "states": {
                "1": {
                    "description": "It´s a small key.",
                    "isAvailable": (state: ActionState): boolean => {
                        return state.room.items.doormat.states.moved.active && !state.inventory[state.itemKey];
                    }
                }
            },
            "actions": {
                "get": (state: ActionState): TransitionState | void => {
                    if (state.inventory[state.itemKey]) {
                        console.log('You already picked it up.');
                        return;
                    }
                    return { addInventory: [[state.itemKey, state.item]] };
                }
            }
        },
        "door": {
            "states": {
                "locked": {
                    "description": "\"Mr. Smith\""
                },
                "unlocked": {
                    "description": "\Mr. Smith\" apartment door, picked with a paperclip."
                },
                "open": {
                    "description": "\Mr. Smith\" apartment door is open."
                }
            },
            "actions": {
                "open": (state:ActionState): TransitionState | void => {
                    if (state.itemStateKey === 'locked')
                        console.log('It`s locked.');
                    else if (state.itemStateKey === 'open')
                        console.log('It`s already open');
                    else if (state.itemStateKey === 'unlocked')
                        return { nextRoom: 'apartment' };
                },
                "paperclip|pick": (state:ActionState): TransitionState | void => {
                    if (state.inventory['paperclip']) {
                        console.log('You gently insert the paperclip in the keyhole, beginning to twist and turn.\nAfter a while you manage to turn the mechanism and unlock the door.');
                        return { nextState: 'unlocked', removeInventory: ['paperclip'] };
                    }
                    console.log('You dont have that.');
                },
                "enter": (state:ActionState): TransitionState | void => {
                    if (state.itemStateKey === 'unlocked') 
                        return { nextRoom: 'apartment' };
                    else
                        console.log('The door is locked');
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