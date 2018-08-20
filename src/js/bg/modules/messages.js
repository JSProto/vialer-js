/**
* VoIPGRID-platform specific functionality. This is especially useful
* to manage call messages/callgroups. It shows the available messages
* and how many callers are in the messages.
* @module ModuleMessages
*/
const Module = require('../lib/module')


/**
* Main entrypoint for Messages.
* @memberof AppBackground.modules
*/
class ModuleMessages extends Module {
    /**
    * @param {AppBackground} app - The background application.
    */
    constructor(app) {
        super(app)

        this._platformData(false)

        this.app.on('bg:messages:send', async({number, text}) => {
            this.sendMessage(number, text);
        })

        // this.app.timer.registerTimer('bg:messages:size', () => {this._platformData(false)})
        // this.app.on('bg:messages:selected', ({message}) => {
        //     if (message) {
        //         this.app.setState({messages: {selected: {id: message.id, number: message.number}}}, {persist: true})
        //     }
        //     else {
        //         this.app.setState({messages: {selected: {id: null, number: null}}}, {persist: true})
        //     }

        //     // this.app.modules.ui.menubarState()
        //     // this.setMessageSizesTimer()
        // })
    }


    /**
    * Initializes the module's store.
    * @returns {Object} The module's store properties.
    */
    _initialState() {
        return {
            messages: [],
            search: {
                disabled: false,
                input: '',
            },
            message: {
                number: '',
                text: [],
            },
            create: false,
            view: false,
            state: null,
            status: null,
        }
    }

    /**
    * Adjust the message-size timer when the WebExtension
    * popup opens or closes.
    * @param {String} type - Whether the popup is set to `close` or `open`.`
    */
    _onPopupAction(type) {
        // this.setMessageSizesTimer()
    }


    /**
    * Load information about message callgroups from the
    * VoIPGRID platform.
    * @param {Boolean} empty - Whether to empty the messages list and set the state to `loading`.
    */
    async _platformData(empty = true) {
        // API retrieval possibility check is already performed at
        // the application level, but is also required here because
        // of the repeated timer function.
        if (!this.app.state || !this.app.state.user.authenticated || !this.app.state.app.online) return
        if (empty) this.app.setState({messages: {messages: [], status: 'loading'}})

        const res = await this.app.api.client.get('api/messages/')
        if (this.app.api.NOTOK_STATUS.includes(res.status)) {
            this.app.logger.warn(`${this}platform data request failed (${res.status})`)
            return
        }

        let messages = res.data.objects

        this.app.setState({messages: {messages: messages, status: null}}, {persist: true})
        this.app.modules.ui.menubarState()
        // this.setMessageSizesTimer()
    }

    /**
    * Converts a message size to a menubar icon state.
    * @param {String|Number} messageSize - The message size as returned from the VoIPGRID API.
    * @returns {String} - The menubar state, which is linked to a .png filename.
    */
    messageMenubarIcon(messageSize) {
        let messageState = 'queue'
        if (!isNaN(messageSize)) {
            if (messageSize < 10) messageState = `queue-${messageSize}`
            else messageState = 'queue-10'
        }
        return messageState
    }

    /**
    * Send message text.
    * @param {String|Number} number - recipient.
    * @param {String} text - The message text.
    */
    async sendMessage(number, text){
        const res = await this.app.api.client.put('api/message/send/', {
            number, text
        });

        this.app.logger.warn(`${this}triggered bg:messages:send`)

        if (this.app.api.NOTOK_STATUS.includes(res.status)) {
            this.app.logger.warn(`${this}message data request failed (${res.status})`)
            return
        }
    }

    /**
    * Register the queus update timer function and
    * the dynamic interval check.
    */
    setMessageSizesTimer() {
        // Set a dynamic timer interval.
        this.app.timer.setTimeout('bg:messages:size', () => {
            let timeout = 0
            // Only when authenticated.
            if (this.app.state.user.authenticated) {
                // Check every 20s when a message is selected, no matter
                // if the popup is opened or closed.
                if (this.app.state.messages.selected.id) {
                    timeout = 20000
                    // Check more regularly when the popup is open and the
                    // messages widget is open.
                    if (this.app.state.ui.visible) timeout = 5000
                }
            }
            this.app.logger.debug(`${this}set message timer to ${timeout} ms`)
            return timeout
        }, true)

        this.app.timer.startTimer('bg:messages:size')
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[messages] `
    }
}

module.exports = ModuleMessages
