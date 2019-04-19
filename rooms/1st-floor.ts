import { WorldInteractable, ActionState, TransitionState } from "../main";

export default {
    "id": "1st floor",
    "states": {
        "initial": {
            "onActivate": "Your`re standing in the entrance of a apartment building. There is a zombie outside. A letterbox. Stairs go up.",
            "description": "Your`re standing in the entrance of a apartment building. There is a zombie outside. A letterbox. Stairs go up."
        }
    },
    "items": {
        "letterbox": {
            "states": {
                "locked": {
                    "description": "A letterbox mounted to the wall. It's locked.",
                    "items": {
                        "screw": {}
                    }
                },
                "unlocked": {
                    "onActivate": "You unlocked the letterbox",
                    "description": "it's unlocked",
                    "items": {
                        "letter": {}
                    }
                }
            },
            "actions": {
                "open": (state:ActionState): TransitionState | void => {
                    if (state.itemStateKey === 'locked')
                        console.log('It`s locked.');
                    else
                        console.log('It`s already open');
                },
                "unlock": (state:ActionState): TransitionState | void => {
                    if (state.inventory['letterbox-key'])
                        return { nextState: 'unlocked' };
                    console.log('You dont have key.');
                }
            }
        },
        "door": {
            "states": {
                "closed": {
                    "description": "The door is closed."
                }
            },
            "actions": {
                "open": (state:ActionState): TransitionState | void => {
                    console.log('You open the door, the zombie kills you.');
                    return { dead: true };
                }
            }
        },
        "letter": {
            "states": {
                "in-letterbox": {
                    "isAvailable": (state:ActionState): boolean => {
                        return state.room.items.letterbox.states.unlocked.active && !state.inventory['letter'];
                    }
                }
            },
            "actions": {
                "read": (state:ActionState): TransitionState | void => {
                    console.log(`Dear Mr. Smith\nThis is a notice of eviction.\n`);
                    return { addInventory: ['letter'] };
                },
                "get": (state:ActionState): TransitionState | void => {
                    return { addInventory: ['letter'] };
                }
            }
        },
        "zombie": {
            "states": {
                "1": {
                    "description": "Half dead, half alive, blood dripping, evil thing hungry for brain."
                }
            },
            "actions": {
                "*": (state:ActionState): TransitionState | void => {
                    console.log('Best to keep away from it - look dangerous.');
                }
            }
        }
    },
    "actions": {
        "up": (state:ActionState): TransitionState | void => {
            return { nextRoom: '2nd floor' };
        }
    }
} as WorldInteractable;