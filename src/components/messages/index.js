module.exports = (app) => {

    const v = Vuelidate.validators

    /**
    * @memberof fg.components
    */
    const Messages = {
        computed: Object.assign({
            filteredMessages: function() {
                let searchQuery = this.search.input.toLowerCase()
                let _filtered = [];

                for (const message of this.messages) {

                    let push = false;

                    if (String(message.number).includes(searchQuery)) {
                        push = true;
                    }
                    else if (String(message.text).includes(searchQuery)) {
                        push = true;
                    }

                    if (push) {
                        _filtered.push(message)
                    }
                }

                // First show the registered accounts; then the unregistered ones.
                return _filtered.sort(app.utils.sortByMultipleKey(['timestamp']));
            },
            filteredMessagesFor: function(){
                let _filtered = [];
                const {number} = this.message;

                for (const message of this.messages) {

                    let push = false;

                    if (String(message.number).includes(number)) {
                        push = true;
                    }

                    // text

                    if (push) {
                        _filtered.push(message)
                    }
                }

                // First show the registered accounts; then the unregistered ones.
                return _filtered.sort(app.utils.sortByMultipleKey(['timestamp']));
            }
        }, app.helpers.sharedComputed()),
        methods: Object.assign({
            send: function(){
                app.emit('bg:messages:send', this.message)

                app.logger.debug('send sms ' + this.message.number);

                app.setState({messages: {message: {text: []}}}, {persist: true})
            },
            createMessage: function(number = '') {
                app.logger.debug('create new sms ' + number);

                app.setState({messages: {create: true, view: !!number, message: {number}}}, {persist: true})

                // this.setLayer('sms')
            },
            closeMessageForm: function() {
                app.setState({messages: {create: false}}, {persist: true})
            },
        }, app.helpers.sharedMethods()),
        render: templates.messages.r,
        staticRenderFns: templates.messages.s,
        store: {
            contacts: 'contacts.contacts',
            messages: 'messages.messages',
            message: 'messages.message',
            filters: 'messages.filters',
            search: 'messages.search',
            status: 'messages.status',
            create: 'messages.create',
            view: 'messages.view',
            user: 'user',
        },

        validations: function() {


            app.logger.debug('value sms ' + Object.keys(v));

            let validations = {
                messages: {
                    message: {
                        number: {
                            required: v.required,
                        },
                        text: {
                            required: v.required,
                        }
                    }
                },
            }

            return validations
        },
    }

    return Messages
}
