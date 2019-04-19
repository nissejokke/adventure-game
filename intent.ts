
export enum Actions {
    quit = 'quit',
    exit = 'exit',
    inventory = 'inventory',
    check = 'check',
    up = 'up',
    down = 'down',
    get = 'get'
}

export interface ActionForm {
    base: Actions,
    alternates: string[]
}

const actionsForms:ActionForm[] = [{
    base: Actions.exit,
    alternates: ['go out', 'leave']
}, {
    base: Actions.check,
    alternates: ['look', 'examine', 'investigate', 'look at', 'check out']
}, {
    base: Actions.up,
    alternates: ['walk up', 'go up']
}, {
    base: Actions.down,
    alternates: ['walk down', 'go down']
}, {
    base: Actions.get,
    alternates: ['take', 'grab', 'pick up']
}];

export class Intent {

    action: Actions;
    public noun: string;
    constructor(private text:string) {
        const { intent, noun } = this.parseText(text);
        this.action = Actions[intent] || intent;
        this.noun = noun;
    }

    private parseText(text:string): { intent: string, noun: string } {
        const textUppercase = text.toUpperCase();
        const startsWith = (a:string) => {
            return textUppercase.startsWith(a.toUpperCase());
        };
        // sort em so that look at will be tested before look
        const sortAlternates = (a, b) => b.split(/ /g).length - a.split(/ /g).length;
        
        let match = actionsForms.filter(form => startsWith(form.base))[0];
        if (match)
            return { intent: match.base, noun: text.substr(match.base.length).trim() };
        
        for (let form of actionsForms)
            for (let alt of form.alternates.sort(sortAlternates))
                if (startsWith(alt))
                    return { intent: form.base, noun: text.substr(alt.length).trim() };
        
        let parts = text.split(/ /g);
        return { intent: parts[0], noun: parts.slice(1).join(' ') };
    }
}
