<template>
    <div id="browse">
        <v-layout justify-center>
            <v-flex xs12 sm12>
                <v-toolbar color="white">
                    <div v-if="this.$root.$children[0].authenticated">
                        <v-toolbar-title class="font-weight-light">Work it, {{claims.name}}!</v-toolbar-title>
                    </div>
                    <v-spacer></v-spacer>Find your workout
                    <v-btn icon>
                        <v-icon>search</v-icon>
                    </v-btn>
                </v-toolbar>
                <div v-if="playerMode">
                    <PlayerComponent 
                      :vid="vidSrc"
                      v-on:close-player="playerMode=false"
                    >
                    </PlayerComponent>
                </div>
                <v-card v-if="!playerMode">
                    <v-container fluid grid-list-xl>
                        <v-layout row wrap>
                            <v-flex
                                v-for="card in cards"
                                :key="card.title"
                                v-bind="{ [`xs${card.flex}`]: true }"
                            >
                                <v-card>
                                    <v-img
                                        :src="card.src"
                                        height="300px"
                                        v-on:click="openPlayer(card)"
                                    >
                                        <v-container fill-height fluid pa-2>
                                            <v-layout fill-height>
                                                <v-flex xs12 align-end flexbox>
                                                    <span
                                                        class="headline white--text"
                                                        v-text="card.title"
                                                    ></span>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-img>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn v-on:click="openPlayer(card)">
                                            <span v-if="!fullVid" class="mr-2">Preview</span>
                                            <span v-if="fullVid" class="mr-2">Watch</span>
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>


<script>
import PlayerComponent from "@/components/Player.vue";

export default {
    name: "browse",
    data: function() {
        return {
            claims: "",
            fullVid: false,
            playerMode: false,
            vidSrc: null,
            vids: [
                {youtubeURL: "https://www.youtube.com/embed/J7D3bOOexf0"},
                {youtubeURL: "https://www.youtube.com/embed/JBgFVmxl0nQ?start=40"},
                {youtubeURL: "https://www.youtube.com/embed/wbMsPHccMpQ"}
            ],
            cards: [
                {
                    title: "Extreme Burn",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo15.jpg",
                    flex: 6
                },
                {
                    title: "Abs Anihilation",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo1.jpg",
                    flex: 3
                },
                {
                    title: "Boxsanity",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo5.jpg",
                    flex: 3
                },
                {
                    title: "Squatsanity",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo4.jpg",
                    flex: 3
                },
                {
                    title: "Calvsanity",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo3.jpg",
                    flex: 3
                },
                {
                    title: "Legsanity",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo13.jpg",
                    flex: 6
                },
                {
                    title: "Lunge day",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo2.jpg",
                    flex: 3
                },
                {
                    title: "Arms Anihilation I",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo6.jpg",
                    flex: 6
                },
                {
                    title: "Arms Anihilation II",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo8.jpg",
                    flex: 3
                },
                {
                    title: "Total Anihilation",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo17.jpg",
                    flex: 6
                },
                {
                    title: "Core Anihilation",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo7.jpg",
                    flex: 3
                },
                {
                    title: "Coresanity",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo10.jpg",
                    flex: 3
                },
                {
                    title: "Coresanity Redux",
                    src: "http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo11.jpg",
                    flex: 3
                }
            ]
        };
    },
    components: {
        PlayerComponent
    },
    created() {
        this.setup();
    },
    updated: function() {
        this.$nextTick(async function() {
            this.fullVid = this.$root.$children[0].cardOnFile;
        });
    },
    methods: {
        async setup() {
            try {
                this.claims = await this.$auth.getUser();
            } catch {
                this.claims = "";
            }
            this.cards.map(card=>{
                let rando = this.randomIntFromInterval(0, this.vids.length - 1)
                let youtubeURL = this.vids[rando].youtubeURL
                card.youtubeURL = youtubeURL + (youtubeURL.indexOf('?') > 1 ? '&' : '?') + 'autoplay=1&mute=1';
            })
        },
        openPlayer(src) {
            this.playerMode = true;
            this.vidSrc = src;
        },
        randomIntFromInterval(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }        
    }
};
</script>


