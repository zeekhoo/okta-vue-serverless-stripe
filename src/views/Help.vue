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
                <v-flex md6>
                    <v-layout column>
                        <h3>2. Save config in UDP</h3>
                        <h4>POST https://safe-escarpment-74832.herokuapp.com</h4><br>
                        <v-card>
                            <pre>(Sample)<br>{{sample}}</pre>
                        </v-card>
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
                    "steps2": "Set redirect_uri = 'https://{{udp_subdomain}}.bod.unidemo.online/implicit/callback'"
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
                    "label": "(Optional)",
                    "steps": "Setup a Facebook integration"
                }
            ],
            sample: {
                "udp_subdomain": "awesome",
                "demo_app_name": "bod",
                "okta_api_token": "xxxxifsdfsieiefio938r9r090k2",
                "client_id": "0oa4ox4jzjHj9vWgR1t7",
                "client_secret": "",
                "user_id": "zeekhoo",
                "issuer": "https://dev-12345.oktapreview.com/oauth2/default",
                "base_url": "https://dev-12345.oktapreview.com",
                "redirect_uri": "https://awesome.bod.unidemo.online/implicit/callback",
                "status": "ready",
                "settings": {
                    "fbId": "0oaxmxaszOUXlhDAu1t6",
                    "prospect_group_id": "00gay1vy250I1hbuU1t7",
                    "customer_group_id": "00gay1wamePMm98QJ1t7"
                }
            }
        }
    },
    methods: {
        prettyPrint: (ugly) => {
            return JSON.stringify(ugly, undefined, 4)
        }
    }  
}
</script>