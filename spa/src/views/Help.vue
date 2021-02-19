<template>
    <div id="help-page">
        <v-container fluid>
            <h1>Setup instructions</h1><br>
            <v-layout row>
                <v-flex md6>
                    <v-layout column>
                        <br><h3>1. Org setup:</h3><br>
                        <v-list three-line>
                            <template v-for="(item, index) in items">
                                <v-list-tile :key="index">
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{item.label}}</v-list-tile-title>
                                        <v-list-tile-sub-title>{{item.steps}}</v-list-tile-sub-title>
                                        <v-list-tile-sub-title v-if="item.steps2">{{item.steps2}}</v-list-tile-sub-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider
                                    :key="index"
                                    :inset="item.inset"
                                ></v-divider>
                            </template>
                        </v-list>
                    </v-layout>
                </v-flex>
            </v-layout>

        </v-container>
    </div>
</template>

<script>
export default {
    name: 'help-page',
    data() {
        return {
            items: [
                {
                    "label": "Add 2 Groups:",
                    "steps": "Create a group named 'prospect' and a group named 'customer'"
                },
                {
                    "label": "Create App",
                    "steps": "Crete an App of Type SPA. Assign the 'Everyone' group to it",
                    "steps2": "Set redirect_uri = 'https://{{udp_subdomain}}.bod.unidemo.online/login/callback'"
                },
                {
                    "label": "Add CORS",
                    "steps": "Add CORS setting for 'https://{{udp_subdomain}}.bod.unidemo.online'"   
                },
                {
                    "label": "Create a custom Auth Server (or use 'Default')",
                    "steps": "Add a custom scope = 'customer' to the Auth Server you will be using"
                },
                {
                    "label": "Extend the User schema",
                    "steps": "Add a custom profile attribute Variable.name = 'goals', Data type='string' to the Okta User Profile"
                },
                {
                    "label": "Create API Token",
                    "steps": "Create an API Token with full admin rights"
                },
                {
                    "label": "Facebook Integration",
                    "steps": "Setup a Facebook integration"
                },
                {
                    "label": "Update the config file",
                    "steps": 'Update the src/.config.js file'
                }
            ]
        }
    },
    methods: {
        prettyPrint: (ugly) => {
            return JSON.stringify(ugly, undefined, 4)
        }
    }  
}
</script>