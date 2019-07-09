<template>
  <div id="browse">
    <v-layout justify-center>
      <v-flex xs12 sm12>
        <v-toolbar color="white">
          <div v-if="this.$root.$children[0].authenticated">
            <v-toolbar-title class="font-weight-light">Work it, {{claims.name}}!</v-toolbar-title>
          </div>
          <v-spacer></v-spacer>
          Find your workout
          <v-btn icon>
            <v-icon>search</v-icon>
          </v-btn>
        </v-toolbar>
        <div
          v-if="playerMode"
          >
          <PlayerComponent
            v-bind:vid="vidSrc"
            v-on:close-player="playerMode=false"
            />
        </div>
        <v-card
          v-if="!playerMode"
          >
          <v-container
            fluid
            grid-list-xl
          >
            <v-layout 
              row wrap>
              <v-flex
                v-for="card in cards"
                :key="card.title"
                v-bind="{ [`xs${card.flex}`]: true }"
              >
                <v-card>
                  <v-img
                    :src="card.src"
                    height=300px
                  >
                    <v-container
                      fill-height
                      fluid
                      pa-2
                    >
                      <v-layout fill-height>
                        <v-flex xs12 align-end flexbox>
                          <span class="headline white--text" v-text="card.title"></span>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-img>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                      v-on:click="playerMode=true; vidSrc=card.src;"
                      >
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
import PlayerComponent from '@/components/Player.vue'

export default {
  name: 'browse',
  data: function(){
    return {
      claims: '',
      fullVid: false,
      playerMode: false,
      vidSrc: null,
      cards: [
              { title: 'Extreme Burn', src: 'https://shawglobalnews.files.wordpress.com/2018/02/people-working-out.jpg?quality=70&strip=all&w=720&h=379&crop=1', flex: 6 },
              { title: 'Abs Anihilation', src: 'https://st.focusedcollection.com/13397678/i/650/focused_161218150-stock-photo-women-working-out-in-gym.jpg', flex: 3 },
              { title: 'Abs Anihilation II', src: 'https://previews.123rf.com/images/4pmproduction/4pmproduction1803/4pmproduction180300466/97904066-group-of-sporty-muscular-people-are-working-out-in-gym-cross-fit-training-hovering-and-doing-abs-exe.jpg', flex: 3 },
              { title: 'Nitro glutes', src: 'https://i2.wp.com/www.shawngarcia.com/wp-content/uploads/2014/10/perfect-legs-with-plyos-1.jpg?resize=560%2C329', flex: 3 },
              { title: 'Calvsanity', src: 'https://legionathletics.com/wp-content/uploads/2016/05/calf-muscle-exercises.jpg.pagespeed.ce.nfyp_akXdv.jpg', flex: 3 },
              { title: 'Legsanity', src: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/glute-leg-excercises-square-1534796250.jpg?crop=1.00xw:0.668xh;0,0.332xh&resize=480:*', flex: 6 },
              { title: 'Cow Crazy', src: 'https://previews.123rf.com/images/wavebreakmediamicro/wavebreakmediamicro1510/wavebreakmediamicro151012797/46688770-fit-people-working-out-in-fitness-class-at-the-gym.jpg', flex: 3 },
              { title: 'Arms Anihilation I', src: 'http://upl.stack.com/wp-content/uploads/2017/01/03112117/HIIT-Training-STACK.jpg', flex: 3 },
              { title: 'Arms Anihilation II', src: 'https://cdn-ami-drupal.heartyhosting.com/sites/muscleandfitness.com/files/media/BarBell_Drag_Curl.jpg', flex: 3 },
              { title: 'Arms Anihilation III', src: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/701/p-1-shoulder-hurts-so-damn-bad-when-you-lift-1515525842.jpg?resize=480:*', flex: 3 },
              { title: 'Total Anihilation', src: 'https://media2.s-nbcnews.com/j/newscms/2017_36/2144546/170905-working-out-group-ac-512p_2b5db137b66bedb7f1d96c24b8ca1b8a.fit-760w.jpg', flex: 12 },
              { title: 'Coresanity', src: 'https://image.shutterstock.com/image-photo/attractive-sports-people-working-out-260nw-609103199.jpg', flex: 3 },
              { title: 'Coresanity Redux', src: 'https://media.istockphoto.com/photos/fit-people-working-out-with-weights-in-a-gym-picture-id921878780?k=6&m=921878780&s=612x612&w=0&h=TvCcrBvtyvso6OvFFJQnSBOsBRgq0nZWQHTt2E58F7c=', flex: 3 }
            ]
    }
  },
  components: {
    PlayerComponent
  },
  created () { this.setup() },
  updated: function() {
    this.$nextTick(async function() {
      this.fullVid = this.$root.$children[0].cardOnFile
    })
  },
  methods: {
    async setup () {
      this.claims = await this.$auth.getUser()
    }
  }  
}
</script>


