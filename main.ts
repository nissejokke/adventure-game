import './polyfills';
import * as readline from 'readline';
import { Intent, Actions } from './intent';

export interface ActionState {
    room: WorldInteractable,
    inventory: WorldItems,
    state: WorldInteractable,
    itemStateKey: string,
    itemState: WorldInteractable
}

interface ActiveState {
    stateKey: string,
    state: WorldInteractable
}

interface WorldStates {
    [index: string]: WorldInteractable
}

interface WorldItems {
    [index: string]: WorldInteractable
}

export interface TransitionState {
    nextState?: string,
    nextRoom?: string,
    dead?: boolean,
    addInventory?: string[]
}

type WorldAction = (state: ActionState) => TransitionState | void;
type WorldIsAvailable = (state: ActionState) => boolean;

interface WorldActions {
    [index: string]: WorldAction
}

export interface WorldInteractable {
    id?: string;
    description?: string;
    active?: boolean;
    isAvailable?: WorldIsAvailable,
    onActivate?: string;
    states?: WorldStates;
    items?: WorldItems;
    actions?: WorldActions;
}

class World {

    currentRoom: WorldInteractable;
    currentState: WorldInteractable;
    rooms: WorldInteractable[];
    inventory: WorldItems;

    constructor() {
        this.currentRoom = null;
        this.inventory = {};
    }

    load() {
        this.rooms = [
            require('./rooms/1st-floor').default,
            require('./rooms/2nd-floor').default
        ];
        this.sanityCheck(this.rooms);
        this.gotoRoom(this.rooms[0]);
    }

    sanityCheck(rooms: WorldInteractable[]) {
        let errors = [];
        for (let room of rooms) {
            for (let action in room.actions) {
                if (!Actions[action])
                    errors.push(`Action ${action} is not defined in Actions enum`);
            }
        }
        if (errors.length)
            throw new Error(errors.join('\n'));
    }

    gotoRoom(room: WorldInteractable) {
        this.currentRoom = room;
        let initialStateKey = Object.keys(room.states)[0];
        this.currentState = room.states[initialStateKey];

        if (this.currentState.onActivate)
            console.log(this.currentState.onActivate);

        const onEnter = room.actions.onEnter;
        if (onEnter)
            this.transitionState(this.currentState, onEnter(this.getActionState(null)));
    }

    parseText(text: string): Intent {
        return new Intent(text);
    }

    /**
     * @returns quit?
     */
    transitionIntentToState(intent: Intent): boolean {
        const room = this.currentRoom;
        let parent = room;
        let action:WorldAction;

        // intent regarding room items?
        const match = this.findMatchingInteractableAction(intent.action, intent.noun, room.items);
        if (match) {
            action = match[0];
            parent = match[1];
        }

        // room intents
        if (!action && !intent.noun)
            action = this.findMatchingAction(intent.action, room.actions);

        // tranisition state
        if (action) {
            const item = room.items[intent.noun];
            let itemState:ActiveState = null;
            if (item)
                itemState = this.getActiveState(item.states);

            const actionState = this.getActionState(itemState);
            const nextState = action(actionState);
            if (nextState) {

                if (nextState.dead) {
                    console.log('Game over');
                    return false;
                }
                else if (nextState.nextRoom) {
                    let nextRoom = this.rooms.find(room => room.id === nextState.nextRoom);
                    this.gotoRoom(nextRoom);
                }
                else if (nextState.addInventory) {
                    for (let inventory of nextState.addInventory)
                        this.inventory[inventory] = {};
                }
                else
                    this.transitionState(parent, nextState);
            }
        }
        else
            console.log('Don`t know how to do that. (', intent.action, intent.noun, ')');
        return true;
    }

    getActiveState(states: WorldStates): ActiveState {
        for (let state in states)
            if (states[state].active)
                return { stateKey: state, state: states[state] };
        for (let state in states)
            return { stateKey: state, state: states[state] };
        return null;
    }

    transitionState(parent: WorldInteractable, transition: TransitionState | void) {
        if (!transition) return;

        const nextState = transition.nextState;
        let next = parent.states[nextState];
        if (!next)
            throw new Error(`Could not transition from ${parent.description || parent} to ${nextState}`);
        for (let currstate in parent.states)
            parent.states[currstate].active = false;
        next.active = true;
        if (next.onActivate)
            console.log(next.onActivate);
    }

    findMatchingInteractableAction(action: string, noun: string, itemsOrRooms: WorldInteractable): [WorldAction, WorldInteractable] {
        const itemOrRoomKey = noun;
        const itemOrRoom = itemsOrRooms[itemOrRoomKey];
        if (!itemOrRoom) return null;
        if (!itemOrRoom.actions) return null;

        if (itemOrRoom.actions[action])
            return [itemOrRoom.actions[action], itemOrRoom];

        if (action === Actions.check) {
            console.log(this.getActiveState(itemOrRoom.states).state.description);
            return [()=>{}, itemOrRoom];
        }

        if (itemOrRoom.actions['*'])
            return [itemOrRoom.actions['*'], itemOrRoom];

        return null;
    }

    findMatchingAction(action: string, actions: WorldActions): WorldAction {
        if (actions[action])
            return actions[action];
        switch (action) {
            case Actions.check:
                return (state:ActionState): TransitionState | void => console.log(this.getActiveState(state.room.states).state.description);
                break;
            case Actions.inventory:
                return (state:ActionState): TransitionState | void => console.log('You have', Object.keys(state.inventory).join(', ') || 'nothing');
                break;
        }
        return null;
    }

    getActionState(item: ActiveState): ActionState {
        return {
            room: this.currentRoom,
            inventory: this.inventory,
            state: this.currentState,
            itemStateKey: item ? item.stateKey : null,
            itemState: item ? item.state : null
        };
    }

    searchRoomItems(startedWord: any): any {
        const itemKeys = Object.keys(this.currentRoom.items);
        const items = this.currentRoom.items;
        const itemStateItemKeys = itemKeys.map(itemKey => {
            const activeState = this.getActiveState(items[itemKey].states);
            if (!activeState || !activeState.state) return [];
            return Object.keys(activeState.state.items || []);
        }).flat();
        return [...new Set(itemKeys.concat(itemStateItemKeys))]
            .filter(itemKey => this.isItemAvailable(items[itemKey]))
            .filter(itemKey => itemKey.startsWith(startedWord));
    }

    isItemAvailable(item: WorldInteractable): boolean {
        if (!item || !item.states) return true;
        let state = this.getActiveState(item.states);
        if (!state.state.isAvailable) return true;
        return state.state.isAvailable(this.getActionState(state));
    }
}

const world = new World();
world.load();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: (line) => {
        const words = line.split(/ /);
        const startedWord = words[words.length - 1];
        const matches = world.searchRoomItems(startedWord);
        return [matches, startedWord];
    }
});

rl.setPrompt(world.currentRoom.id + '> ');
rl.prompt();
rl.on('line', (line) => {
    const intent = world.parseText(line);
    if (intent.action === Actions.quit) rl.close();
    if (!world.transitionIntentToState(intent)) rl.close();
    rl.setPrompt(world.currentRoom.id + '> ');
    rl.prompt();
}).on('close', function () {
    process.exit(0);
});