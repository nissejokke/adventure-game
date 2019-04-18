import { WorldInteractable, ActionState } from "../main";

export default {
    "states": {
        "initial": {
            "description": "Your`re standing in the entrance of a apartment building."
        }
    },
    "items": {
        "letterbox": {
            "states": {
                "locked": {
                    "description": "A letterbox. It's locked."
                },
                "unlocked": {
                    "onActivate": "you unlocked the letterbox",
                    "description": "it's unlocked",
                    "items": {
                        "letter": {}
                    }
                }
            },
            "actions": {
                "check": (state:ActionState): string => {
                    console.log(state.itemState.description);
                    return null;
                },
                "open": (state:ActionState): string => {
                    if (state.itemStateKey === 'locked')
                        console.log('You dont have key.');
                    else
                        console.log('It`s already open');
                    return null;
                },
                "unlock": (state:ActionState): string => {
                    if (state.inventory.key)
                        return 'unlocked';
                    console.log('You dont have key.');
                    return null;
                }
                // "*": (state:ActionState): string => {
                //     console.log('Don`t know how to do that, it`s a letterbox for gods sake');
                //     return null;
                // }
            }
        },
        "door": {
            "states": {
                "closed": {
                    "description": "The door is closed, there is a zombie outside"
                },
                "open": {
                    "description": "The door is open"
                }
            },
            "actions": {
                "open": (state:ActionState): string => {
                    return 'open';
                },
                "exit": (state:ActionState): string => {
                    return 'outside';
                }
            }
        }
    },
    "actions": {
        "check": (state:ActionState): string => {
            console.log(state.state.description);
            console.log('There is a letterbox there.');
            return null;
        },
        "onEnter": (state:ActionState): string => {
            console.log(state.state.description);
            return null;
        }
    }
} as WorldInteractable;