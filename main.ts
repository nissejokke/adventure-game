import * as readline from 'readline';
import { Intent, Actions } from './intent';

export interface ActionState {
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
    [index:string]: WorldInteractable
}

interface WorldItems {
    [index:string]: WorldInteractable
}

type WorldAction = (state:ActionState) => string;

interface WorldActions {
    [index:string]: WorldAction
}

export interface WorldInteractable {
    description?: string;
    active?: boolean;
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
        this.rooms = [require('./rooms/1st-floor').default];
        this.currentRoom = this.rooms[0];
        let initialStateKey = Object.keys(this.currentRoom.states)[0];
        this.currentState = this.currentRoom.states[initialStateKey];
        const onEnter = this.currentRoom.actions.onEnter;
        if (onEnter)
            this.transitionState(this.currentState, onEnter(this.getActionState(null)));
    }

    parseText(text:string): Intent {
        return new Intent(text);
    }

    transitionIntentToState(intent:Intent) {
        const room = this.currentRoom;
        let parent = room;
        let action;
        const match = this.findMatchingInteractableAction(intent.action, intent.noun, room.items);
        if (match) {
            action = match[0];
            parent = match[1];
        }
        
        if (!action)
            action = this.findMatchingAction(intent.action, room.actions);

        if (action) {
            const item = room.items[intent.noun];
            let itemState = null;
            if (item)
                itemState = this.getActiveState(item.states);

            const actionState = this.getActionState(itemState);
            const nextState = action(actionState);
            this.transitionState(parent, nextState);
        }
        else
            console.log('Don`t know how to do that. (', intent.action, intent.noun, ')');
    }

    getActiveState(states: WorldStates): ActiveState {
        for (let state in states)
            if (states[state].active)
                return { stateKey: state, state: states[state] };
        for (let state in states)
            return { stateKey: state, state: states[state] };
        return null;
    }

    transitionState(parent:WorldInteractable, nextState:string) {
        if (!nextState) return;

        let next = parent.states[nextState];
        if (!next)
            throw new Error(`Could not transition from ${parent.description || parent} to ${nextState}`);
        for (let currstate in parent.states)
            parent.states[currstate].active = false;
        next.active = true;
    }

    findMatchingInteractableAction(action:string, noun:string, itemsOrRooms:WorldInteractable): [WorldAction, WorldInteractable] {
        const itemOrRoomKey = noun;    
        const itemOrRoom = itemsOrRooms[itemOrRoomKey];
        if (!itemOrRoom) return null;

        if (itemOrRoom.actions[action])
            return [itemOrRoom.actions[action], itemOrRoom];
        
        if (itemOrRoom.actions['*'])
            return [itemOrRoom.actions['*'], itemOrRoom];

        return null;
    }

    findMatchingAction(action:string, actions:WorldActions): WorldAction {
        return actions[action];
    }

    getActionState(item: ActiveState): ActionState {
        return {
            inventory: this.inventory,
            state: this.currentState,
            itemStateKey: item ? item.stateKey : null,
            itemState: item ? item.state : null
        };
    }
}

const world = new World();
world.load();
const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('adventure> ');
rl.prompt();
rl.on('line', (line) => {
    const intent = world.parseText(line);
    if (intent.action === Actions.quit) rl.close();
    world.transitionIntentToState(intent);
    rl.prompt();
}).on('close',function(){
    process.exit(0);
});