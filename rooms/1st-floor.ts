import { WorldInteractable, ActionState, TransitionState } from "../main";

export default {
    "id": "1st floor",
    "states": {
        "initial": {
            "onActivate": "Your`re standing in the entrance of a apartment building. There is a zombie outside.",
            "description": "Your`re standing in the entrance of a apartment building."
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
                        console.log('You dont have key.');
                    else
                        console.log('It`s already open');
                },
                "unlock": (state:ActionState): TransitionState | void => {
                    if (state.inventory.key)
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
        }
    },
    "actions": {
        "check": (state:ActionState): TransitionState | void => {
            console.log(state.state.description);
            console.log('There is a letterbox.');
            console.log('There and a zombie outside.');
            console.log('A staircase goes up to the 2nd floor.');
        },
        // "onEnter": (state:ActionState): TransitionState | void => {
        //     console.log(state.state.description);
        // }
    }
} as WorldInteractable;