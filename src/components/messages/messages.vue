<component class="component-messages">
    <div class="panel-content">
        <header>
            <div class="header-line">
                <h1 class="uc">{{$t('sms')}}</h1>
                <div class="vertical-devider"></div>
                <div class="content-filters">
                    <div class="filter"  @click="createMessage()">
                        <icon name="mail"/>&nbsp;
                    </div>
                    <div class="close-button" v-if="create" @click="closeMessageForm()">
                        <icon name="close"/>&nbsp;
                    </div>
                </div>
            </div>
            <div class="header-line messages-options" v-if="!create">
                <input class="input" autofocus type="email"
                    :placeholder="$t('find message') + '...'"
                    :disabled="search.disabled"
                    v-model="search.input"/>
            </div>
        </header>

        <div class="message-chat" v-if="create">

            <div class="messages-list">
                <template v-for="msg in filteredMessagesFor" v-if="view">
                    <div class="message-info" :class="{'out': msg.out, 'in': !msg.out}">{{msg.text}}</div>
                </template>
            </div>

            <div class="message-form">

                <Field name="receiver" type="text"
                    :model.sync="message.number"
                    :placeholder="$t('Receiver')"
                    :readonly="view"
                    :validation="$v.messages.message.number"/>

                <Field name="text" type="textarea"
                    :help="$t('Type to send a message.')"
                    :model.sync="message.text"
                    :placeholder="$t('Type to send a message')"
                    :validation="$v.messages.message.text"/>

                <div class="tabs-actions field is-grouped">
                    <button class="button is-primary cf"  @click="send">{{$t('send')}}</button>
                </div>
            </div>
        </div>

        <div class="messages-list" v-if="!create">
            <div class="message" v-for="msg in filteredMessages">

                <div class="message-info">
                    <div class="name">{{msg.number}}</div>
                    <div class="description">{{msg.text}}</div>
                </div>

                <div class="message-specials">
                    <!-- <icon class="favorite" name="check" v-if="contact.favorite"/> -->
                </div>

                <div class="item-slider">
                    <div class="item-slider-option transparent"  @click="createMessage(msg.number)">&nbsp;</div>
                    <!-- <div class="item-slider-option grey close-button"  v-on:click="deleteMessage(message)">
                        Del.
                        <icon name="close"/>
                    </div> -->
                </div>
            </div>

            <div class="message" v-if="status === 'loading'">
                <div class="avatar">
                    <icon class="spinner" name="spinner"/>
                </div>
                <div class="info">
                    <div class="name cf">{{$t('loading messages')}}...</div>
                </div>
            </div>

            <!-- No search results -->
            <div class="no-results" v-else-if="!filteredMessages.length">
                <icon class="no-results-icon" name="messages"/>
                <div class="no-results-text">{{$t('no {target} found', {target: $t('messages')})}}...</div>
            </div>
        </div>


        <!-- Fill up some space by suggesting to add another message -->
        <div class="notification-box info" v-if="messages.length <= 1">
            <header>
                <icon name="info"/>
                <span class="cf">{{$t('adding more message')}}</span>
            </header>
            <div class="description cf">
                {{$t('you have {count} message. ::: you have {count} messages.', {count: messages.length}, messages.length)}}
            </div>
        </div>
    </div>


</component>