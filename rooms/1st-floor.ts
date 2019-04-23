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
                    }
                },
                "unlocked": {
                    "onActivate": "You unlocked the letterbox. There is a letter there.",
                    "description": "A letterbox. It's unlocked.",
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
                    if (state.inventory['small-key'])
                        return { nextState: 'unlocked', removeInventory: ['small-key'] };
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
                    console.log('There is a zombie outside, you would`nt want that.');
                }
            }
        },
        "letter": {
            "states": {
                "in-letterbox": {
                    "description": "It`s a letter.",
                    "isAvailable": (state:ActionState): boolean => {
                        return state.room.items.letterbox.states.unlocked.active && !state.inventory[state.itemKey];
                    }
                },
                "examined": {
                    "onActivate": "A letter with a paperclick.",
                    "description": "A letter with a paperclick.",
                    "items": {
                        "paperclick": {}
                    }
                }
            },
            "actions": {
                "check": (state:ActionState): TransitionState | void => {
                    if (state.inventory.letter) {
                        if (!state.inventory.letter.states.examined.active)
                            return { nextState: 'examined' };
                    }
                    
                    console.log(state.itemState.description);
                },
                "read": (state:ActionState): TransitionState | void => {
                    console.log(`Dear Mr. Smith\nThis is a 14 days notice of eviction.`);
                    if (!state.inventory.letter)
                        return { addInventory: [[state.itemKey, state.item]] };
                },
                "get": (state:ActionState): TransitionState | void => {
                    if (!state.inventory.letter)
                        return { addInventory: [[state.itemKey, state.item]] };
                    console.log('You already have it.');
                }
            }
        },
        "paperclip": {
            "states": {
                "1": {
                    "description": "A robust paperclick",
                    "isAvailable": (state:ActionState): boolean => {
                        return state.room.items.letter.states.examined.active;
                    }
                }
            },
            "actions": {
                "get": (state:ActionState): TransitionState | void => {
                    return { addInventory: [[state.itemKey, state.item]] };
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
                "kill": (state:ActionState): TransitionState | void => {
                    console.log('With what? - look dangerous.');
                },
                "*": (state:ActionState): TransitionState | void => {
                    console.log('Best to keep away from it - look dangerous.');
                }
            }
        }
    },
    "actions": {
        "exit": (state:ActionState): TransitionState | void => {
            console.log('There is a zombie outside, you would`nt want that.');
        },
        "up": (state:ActionState): TransitionState | void => {
            return { nextRoom: '2nd floor' };
        }
    }
} as WorldInteractable;