<style scoped>
.v-card--reveal {
    align-items: center;
    bottom: 0;
    justify-content: center;
    opacity: 0.5;
    position: absolute;
    width: 100%;
}
</style>

<template>
    <v-container>
        <v-layout column>
            <v-dialog v-model="dialog" width="700">
                <v-card>
                    <v-container>
                        <h2>Signup to watch 6 minute previews of every workout we have</h2>
                        <br/><br/>
                        <h4>You will also receive a discount code by email</h4>
                    </v-container>
                    <SignupComponent />
                </v-card>
            </v-dialog>

            <v-dialog v-model="dialog2" width="700">
                <v-card>
                    <v-container>
                        <RegisterComponent :noMorePreviews="noMorePreviews"/>
                    </v-container>
                </v-card>
            </v-dialog>

            <v-hover>
                <v-card slot-scope="{ hover }">
                    <v-container>
                        <v-alert v-model="showAlert" :type="alertType" dismissible>{{alertMessage}}</v-alert>
                        <v-img
                            v-if="!playVid"
                            v-on:click.native="preview()"
                            :src="vid.src"
                            height="550px"
                        >
                            <v-expand-transition>
                                <div v-if="hover">
                                    <div
                                        class="d-flex transition-fast-in-fast-out darken-2 v-card--reveal display-3 white--text"
                                        style="height: 100%;"
                                    >
                                      {{clickToWatch}}
                                      <v-progress-circular
                                          v-if="waiting"
                                          indeterminate
                                          color="white"
                                          size="80"
                                      ></v-progress-circular>
                                    </div>
                                </div>
                            </v-expand-transition>
                        </v-img>
                        <VideoPlayer :video="vid.youtubeURL" v-if="playVid"></VideoPlayer>
                        <v-card-actions>
                            <v-btn v-on:click="upgrade()" color="orange" v-if="showUpgradeButton">
                                <span class="mr-2">Subscribe</span>
                            </v-btn>
                            <v-btn v-on:click="$emit('close-player')">
                                <span class="mr-2">Back</span>
                            </v-btn>
                        </v-card-actions>
                    </v-container>
                </v-card>
            </v-hover>
        </v-layout>
    </v-container>
</template>

<script>
import atob from "atob";
import playButton from "@/assets/img/Play.png";
import SignupComponent from "@/components/Signup.vue";
import RegisterComponent from "@/components/Register.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";
import oktaAuthConfig from "@/.config.js";
import axios from "axios";
import AuthJS from "@okta/okta-auth-js";

export default {
    name: "Player",
    data() {
        return {
            authJs: null,
            user: false,
            payload: false,
            claims: [],
            image: {
                people: require("@/assets/img/people-working-out.jpg"),
                button: playButton
            },
            dialog: false,
            dialog2: false,
            showAlert: false,
            alertType: null,
            alertMessage: null,
            playVid: false,
            tokenToRenew: null,
            waiting: false,
            noMorePreviews: undefined
        };
    },
    computed: {
        showUpgradeButton() {
            return !this.$root.$children[0].cardOnFile;
        },
        clickToWatch() {
          return this.waiting ? '' : 'Click To Watch'
        }
    },
    components: {
        SignupComponent,
        RegisterComponent,
        VideoPlayer
    },
    props: {
        vid: Object
    },
    methods: {
        async preview() {
            this.waiting = true;
            if (!this.$root.$children[0].authenticated) {
                this.dialog = true;
                this.waiting = false;
            } else {
                const access_token = await this.$root.$children[0].$auth.getAccessToken();
                const b_access_token = JSON.parse(
                    atob(access_token.split(".")[1])
                );
                let mock = "none";
                if (oktaAuthConfig.isRunningLocal)
                    mock = oktaAuthConfig.mock_subdomain;

                if (!b_access_token.scp.includes("customer")) {
                    if (this.$root.$children[0].numFreebiesAvailable <= 0) {
                        console.log('no more freebies');
                        this.noMorePreviews = "You have no more previews. Signup now and get one month free!";
                        this.dialog2 = true;
                        this.waiting = false;
                        return;
                    }
                }

                axios({
                    method: "get",
                    url:
                        oktaAuthConfig.bod_api +
                        "/unidemo/public/bod/video-player/play",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + access_token,
                        MockSubdomain: mock
                    }
                })
                .then(res => {
                    console.log(res.data);
                    this.showAlert = true;
                    this.alertType = res.data.alertType;
                    this.alertMessage = res.data.message;

                    if (b_access_token.scp.includes("customer")) {
                        // alert('video plays...')
                        this.wholeVideoAlert = true;
                        this.waiting = false;
                    } else {
                        // alert('6 minute preview clip plays...')
                        this.sixMinuteAlert = true;
                        this.playVid = true;
                        this.$root.$children[0].numFreebiesAvailable =
                            this.$root.$children[0].numFreebiesAvailable -
                            1;
                        this.authJs.token
                            .renew(this.tokenToRenew)
                            .then(res => {
                                this.authJs.tokenManager.add(
                                    "idToken",
                                    res
                                );
                            });
                        this.waiting = false;
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.waiting = false;
                });
            }
        },
        upgrade() {
            this.dialog2 = true;
        }
    },
    async created() {
        const oktaAuth = new AuthJS({
            url: oktaAuthConfig.oidc.issuer.split("/oauth2/")[0],
            issuer: oktaAuthConfig.oidc.issuer,
            clientId: oktaAuthConfig.oidc.client_id,
            redirectUri: oktaAuthConfig.oidc.redirect_uri
        });
        const tokenToRenew = await oktaAuth.tokenManager.get("idToken");
        this.tokenToRenew = tokenToRenew;
        this.authJs = oktaAuth;

        this.user = await this.$auth.getUser();
        const accessTokenPayload = await this.$auth.getAccessToken();
        if (accessTokenPayload) {
            this.payload = JSON.parse(atob(accessTokenPayload.split(".")[1]));
            this.claims = Object.entries(this.payload).map(entry => ({
                claim: entry[0],
                value: entry[1]
            }));
        }
    }
};
</script>
